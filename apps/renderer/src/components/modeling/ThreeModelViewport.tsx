import { useEffect, useRef } from "react";
import * as THREE from "three";

import type { ModelingObject3D, ModelingScene } from "../../engines";

type ThreeModelViewportProps = {
  scene: ModelingScene;
  selectedObjectId: string | null;
  onSelectObject: (objectId: string | null) => void;
};

function createGeometryForPrimitive(primitive: ModelingObject3D["primitive"]) {
  switch (primitive) {
    case "sphere":
      return new THREE.SphereGeometry(0.5, 32, 16);
    case "cylinder":
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    case "cone":
      return new THREE.ConeGeometry(0.5, 1, 32);
    case "plane":
      return new THREE.PlaneGeometry(1, 1);
    case "torus":
      return new THREE.TorusGeometry(0.5, 0.15, 16, 48);
    case "cube":
    case "custom":
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

export function ThreeModelViewport({
  scene,
  selectedObjectId,
  onSelectObject,
}: ThreeModelViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(
    null
  );
  const objectGroupRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color("#08080a");

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
      });
    } catch (error) {
      console.error("Failed to create Three.js renderer", error);

      const fallback = document.createElement("div");
      fallback.className = "threeModelViewportFallback";
      fallback.textContent =
        "3D viewport failed to initialize. Check WebGL / GPU support.";
      host.appendChild(fallback);

      return () => {
        if (fallback.parentElement === host) {
          host.removeChild(fallback);
        }
      };
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      60,
      Math.max(host.clientWidth / Math.max(host.clientHeight, 1), 0.1),
      0.1,
      1000
    );

    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight("#ffffff", 0.55);
    const directional = new THREE.DirectionalLight("#ffffff", 0.85);
    directional.position.set(5, 8, 10);

    const grid = new THREE.GridHelper(20, 20, "#444444", "#222222");
    grid.visible = scene.viewport.gridEnabled;
    gridRef.current = grid;

    const objectGroup = new THREE.Group();

    threeScene.add(ambient);
    threeScene.add(directional);
    threeScene.add(grid);
    threeScene.add(objectGroup);

    rendererRef.current = renderer;
    threeSceneRef.current = threeScene;
    cameraRef.current = camera;
    objectGroupRef.current = objectGroup;

    function handleResize() {
      if (!host || !rendererRef.current || !cameraRef.current) return;

      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);

      rendererRef.current.setSize(width, height);

      const activeCamera = cameraRef.current;

      if (activeCamera instanceof THREE.PerspectiveCamera) {
        activeCamera.aspect = width / height;
        activeCamera.updateProjectionMatrix();
      }

      if (activeCamera instanceof THREE.OrthographicCamera) {
        const aspect = width / height;

        activeCamera.left = -8 * aspect;
        activeCamera.right = 8 * aspect;
        activeCamera.top = 8;
        activeCamera.bottom = -8;
        activeCamera.updateProjectionMatrix();
      }
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(host);

    let animationFrame = 0;

    function renderLoop() {
      animationFrame = window.requestAnimationFrame(renderLoop);

      if (!rendererRef.current || !threeSceneRef.current || !cameraRef.current) {
        return;
      }

      rendererRef.current.render(threeSceneRef.current, cameraRef.current);
    }

    renderLoop();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();

      renderer.dispose();

      threeScene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();

          if (Array.isArray(node.material)) {
            node.material.forEach((material) => material.dispose());
          } else {
            node.material.dispose();
          }
        }
      });

      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }

      rendererRef.current = null;
      threeSceneRef.current = null;
      cameraRef.current = null;
      objectGroupRef.current = null;
      gridRef.current = null;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const oldCamera = cameraRef.current;
    const threeScene = threeSceneRef.current;

    if (!host || !oldCamera || !threeScene) return;

    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    const aspect = Math.max(width / height, 0.1);

    const nextCamera =
      scene.camera.mode === "orthographic"
        ? new THREE.OrthographicCamera(
            -8 * aspect,
            8 * aspect,
            8,
            -8,
            0.1,
            1000
          )
        : new THREE.PerspectiveCamera(
            scene.camera.fovDegrees,
            aspect,
            0.1,
            1000
          );

    nextCamera.position.set(
      scene.camera.position.x,
      scene.camera.position.y,
      scene.camera.position.z
    );

    nextCamera.zoom = scene.camera.zoom;

    const cameraDirection = new THREE.Vector3(
      scene.camera.target.x - scene.camera.position.x,
      scene.camera.target.y - scene.camera.position.y,
      scene.camera.target.z - scene.camera.position.z
    ).normalize();

    if (Math.abs(cameraDirection.y) > 0.95) {
      nextCamera.up.set(0, 0, -1);
    } else {
      nextCamera.up.set(0, 1, 0);
    }

    nextCamera.lookAt(
      scene.camera.target.x,
      scene.camera.target.y,
      scene.camera.target.z
    );

    nextCamera.updateProjectionMatrix();

    cameraRef.current = nextCamera;
  }, [
    scene.camera.mode,
    scene.camera.zoom,
    scene.camera.fovDegrees,
    scene.camera.position.x,
    scene.camera.position.y,
    scene.camera.position.z,
    scene.camera.target.x,
    scene.camera.target.y,
    scene.camera.target.z,
  ]);

  useEffect(() => {
    if (!gridRef.current) return;

    gridRef.current.visible = scene.viewport.gridEnabled;
  }, [scene.viewport.gridEnabled]);

  useEffect(() => {
    const objectGroup = objectGroupRef.current;
    if (!objectGroup) return;

    objectGroup.clear();

    for (const object of scene.objects) {
      if (!object.visible) continue;

      const geometry = createGeometryForPrimitive(object.primitive);
      const material = new THREE.MeshStandardMaterial({
        color: object.id === selectedObjectId ? "#ffcc66" : "#8b8bff",
        roughness: 0.55,
        metalness: 0,
        transparent: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = object.name;
      mesh.userData.objectId = object.id;

      mesh.position.set(
        object.transform.position.x,
        object.transform.position.y,
        object.transform.position.z
      );

      mesh.rotation.set(
        THREE.MathUtils.degToRad(object.transform.rotation.x),
        THREE.MathUtils.degToRad(object.transform.rotation.y),
        THREE.MathUtils.degToRad(object.transform.rotation.z)
      );

      mesh.scale.set(
        object.transform.scale.x,
        object.transform.scale.y,
        object.transform.scale.z
      );

      objectGroup.add(mesh);
    }
  }, [scene.objects, selectedObjectId]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const host = hostRef.current;
    const camera = cameraRef.current;
    const objectGroup = objectGroupRef.current;

    if (!host || !camera || !objectGroup) return;

    const rect = host.getBoundingClientRect();

    pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(pointerRef.current, camera);

    const intersections = raycasterRef.current.intersectObjects(
      objectGroup.children,
      false
    );

    const selectedId = intersections[0]?.object.userData.objectId;

    onSelectObject(typeof selectedId === "string" ? selectedId : null);
  }

  return (
    <div
      className="threeModelViewport"
      ref={hostRef}
      onPointerDown={handlePointerDown}
    />
  );
}

