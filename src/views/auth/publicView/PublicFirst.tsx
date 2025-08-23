import React, { useEffect, useState, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Html, useProgress, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { apiGetCrmImageByIdPublic, apiGetCrmMainThreeImagePublic } from "@/services/CrmService";
import { useSearchParams, useLocation } from "react-router-dom";
import Loading from "react-loading";

// Define a local interface to avoid import conflicts, aligning with expected structure

// Loader component
const Loader = () => {
    const queryParams = new URLSearchParams(location.search);
    const imgId = queryParams.get("imgId") || "";

    return (
        <Html center zIndexRange={[0, 0]} style={{ pointerEvents: "none" }}>
            {!imgId ? (
                <div className="flex text-white bg-gray-800 h-[36.9rem] items-center justify-center w-[58rem] rounded-lg border-2">
                    <span>Select an image!</span>
                </div>
            ) : (
                <div className="flex h-[36.9rem] bg-gray-800 items-center justify-center w-[58rem] border-2">
                    <Loading type="bubbles" color="#3498db" height={100} width={100} />
                </div>
            )}
        </Html>
    );
};

// Box component with typed props
// interface BoxProps {
//     position: [number, number, number];
//     data: CrmDataItem;
//     name?: string;
//     hovered: boolean;
//     click: (value: boolean) => void;
//     clicked: boolean;
//     hover: (value: boolean) => void;
//     handleClick: () => void;
// }

function Box({ position, data, name, hovered, click, clicked, hover, handleClick }: any) {
    const ref = useRef<THREE.Mesh>(null);
    const textRef = useRef<THREE.Object3D>(null); // Type for Text component
    const { gl, camera } = useThree();

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta;
        }
        if (textRef.current) {
            textRef.current.lookAt(camera.position); // Now typed correctly
        }
    });

    return (
        <group onClick={handleClick}>
            <Html zIndexRange={[0, 0]} position={[0, 15, 0]} center>
                <div
                    style={{
                        color: hovered ? "black" : "purple",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        zIndex: -1,
                        transform: "translate(-50%, -100%)",
                    }}
                >
                    {name}
                </div>
            </Html>

            <mesh
                position={position}
                ref={ref}
                scale={hovered ? 1.5 : 1}
                onClick={() => click(!clicked)}
                onPointerOver={() => { hover(true); gl.domElement.style.cursor = "pointer"; }}
                onPointerOut={() => { hover(false); gl.domElement.style.cursor = "auto"; }}
            >
                <torusGeometry args={[10, 1, 80, 100]} />
                <meshStandardMaterial color={hovered ? "black" : "white"} />
            </mesh>
        </group>
    );
}

// Hotspot component with typed props
// interface HotspotProps {
//     data: CrmDataItem;
//     setCurrentView: React.Dispatch<React.SetStateAction<CrmDataItem | null>>;
// }

const Hotspot = ({ data, setCurrentView }:any) => {
    const [hovered, setHovered] = useState(false);
    const { gl } = useThree();
    const [searchParams, setSearchParams] = useSearchParams();

    const position = new THREE.Vector3(data?.crd?.[0] || 0, data?.crd?.[1] || 0, data?.crd?.[2] || 0);

    const handleClick = () => {
        setCurrentView(data); // Type matches CrmDataItem | null
        const updatedParams = new URLSearchParams(searchParams);
        const prevMainId = updatedParams.get("imgId");

        updatedParams.set("imgId", data.img_id);

        if (prevMainId) {
            const paramIndex = updatedParams.size;
            updatedParams.set(paramIndex.toString(), prevMainId);
        }
        setSearchParams(updatedParams);
    };

    return (
        <group position={position}>
            <mesh
                onClick={handleClick}
                scale={[1.5, 1.8, 1.2]}
                onPointerOver={() => { setHovered(true); gl.domElement.style.cursor = "pointer"; }}
                onPointerOut={() => { setHovered(false); gl.domElement.style.cursor = "auto"; }}
                castShadow
            >
                <sphereGeometry args={[5, 32, 32]} />
                <Box
                    position={[1.2, 0, 0]}
                    data={data}
                    name={data?.name}
                    hovered={hovered}
                    hover={setHovered}
                    handleClick={handleClick}
                    click={(value: boolean) => setHovered(value)}
                    clicked={hovered}
                />
                <meshStandardMaterial color={hovered ? "white" : "purple"} />
            </mesh>
        </group>
    );
}

const Scene = ({ texture, testData, setCurrentView, currentView, orgId, userId }: any) => {
    const { camera, scene, gl } = useThree();
    const [hotspots, setHotspots] = useState<any>(currentView?.hp);
    const [hpLoading, setHpLoading] = useState<boolean>(false);
    const queryParams = new URLSearchParams(location.search);
    const leadId = queryParams.get("lead_id") || null;
    const projectId = queryParams.get("project_id") || null;

    useEffect(() => {
        setHotspots(currentView?.hp || []);
    }, [currentView]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setHpLoading(false);
                if (currentView?.img_id) {
                    const res = await apiGetCrmMainThreeImagePublic("hp", currentView.img_id, leadId, projectId, orgId, userId);
                    console.log("res from public view : ",res)
                    setHotspots((res?.data[0])?.hp || []);
                }
                setHpLoading(true);
            } catch (error: any) {
                throw new Error(error);
            }
        };
        if (currentView?.img_id) {
            fetchData();
        }
    }, [currentView, leadId, projectId]);

    return (
        <group>
            <mesh>
                <sphereGeometry args={[500, 60, 40]} />
                <meshBasicMaterial map={texture} side={THREE.BackSide} />
            </mesh>
            {hotspots?.map((data: any, index: number) => (
                <Hotspot key={index} data={data} setCurrentView={setCurrentView} />
            ))}
        </group>
    );
}

const Second = ({ imageUrl, setTexture, testData, currentView, setCurrentView, orgId, userId }: any) => {
    const [texture, setLocalTexture] = useState<THREE.Texture | null>(null); // Local state for texture
    const { progress } = useProgress();
    const textureLoader = new THREE.TextureLoader();

    useEffect(() => {
        if (imageUrl) {
            textureLoader.load(imageUrl, (loadedTexture) => {
                loadedTexture.flipY = false;
                loadedTexture.colorSpace = THREE.SRGBColorSpace;
                setLocalTexture(loadedTexture); // Update local state
                setTexture(loadedTexture); // Sync with parent state
            }, undefined, (error) => {
                console.error("Texture loading error:", error);
                setLocalTexture(null);
                setTexture(null);
            });
        } else {
            setLocalTexture(null);
            setTexture(null); // Reset when no imageUrl
        }
    }, [imageUrl, setTexture]);

    return (
        <Canvas
            style={{ height: "36.9rem", width: "58rem" }}
            className="border-2 rounded-lg"
            camera={{ position: [0, 0, 0.1] }}
        >
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                rotateSpeed={-0.3}
                autoRotate={false}
                autoRotateSpeed={0.5}
            />
            <ambientLight intensity={1} />
            {progress < 100 ? (
                <Loader />
            ) : (
                <Scene
                    texture={texture} // Use local texture state
                    testData={testData}
                    setCurrentView={setCurrentView}
                    currentView={currentView}
                    orgId={orgId}
                    userId={userId}
                />
            )}
        </Canvas>
    );
};

const PublicFirst = ({ imgIdList, currentImage, setCurrentImage, setImgList, orgId, userId }: any) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const leadId = queryParams.get("lead_id") || null;
    const projectId = queryParams.get("project_id") || null;
    const imgId = queryParams.get("imgId") || "";

    const [testData, setTestData] = useState<any>(currentImage)
    const [texture, setTexture] = useState<THREE.Texture | null>(null); // Properly initialized
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            console.log("org id : ",orgId)
            console.log("user id : ",userId)
            const res = await apiGetCrmImageByIdPublic(imgId, leadId, projectId, orgId, userId);

            const paramEntries = Array.from(searchParams.entries());
            const idParams = paramEntries
                .filter(([key]) => key !== "imgId" && key !== "lead_id" && key !== "project_id")
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([, value]) => value);

            const imgId2 = searchParams.get("imgId");
            if (imgId2) idParams.push(imgId2);

            setImgList(idParams);
            setTestData(res?.data[0] || null);
            setCurrentImage(res?.data[0] || null);
        };

        fetchData();
    }, [imgId, leadId, projectId, setCurrentImage, setImgList, searchParams]);

    const [currentView, setCurrentView] = useState<any>({});

    useEffect(() => {
        setCurrentView(currentImage);
    }, [currentImage]);

    const handleTagClick = (clickedImgId: string) => {
        setImgList((prev: string[]) => {
            const index = prev.indexOf(clickedImgId);
            return index !== -1 ? prev.slice(0, index + 1) : [...prev, clickedImgId];
        });

        const updatedParams = new URLSearchParams(searchParams);
        const updatedParams2 = new URLSearchParams();

        if (leadId) {
            updatedParams2.set("lead_id", leadId);
        } else if (projectId) {
            updatedParams2.set("project_id", projectId);
        }

        let indexedParams: { index: number; value: string }[] = [...updatedParams.entries()]
            .filter(([key]) => !isNaN(Number(key)) && Number(key) >= 2)
            .map(([key, value]) => ({ index: Number(key), value }))
            .sort((a, b) => a.index - b.index);

        let extractedList = indexedParams.map((item) => item.value);

        const index = extractedList.indexOf(clickedImgId);
        if (index !== -1) {
            extractedList = extractedList.slice(0, index + 1);
        } else {
            extractedList.push(clickedImgId);
        }

        extractedList.slice(0, -1).forEach((item, index) => {
            updatedParams2.set((index + 2).toString(), item);
        });

        updatedParams2.set("imgId", extractedList[extractedList.length - 1]);
        setImgList(extractedList);
        setSearchParams(updatedParams2);
    };

    return (
        <div className="w-[70%] relative">
            <div className="flex text-white px-4 py-2 rounded z-10">
                {imgId &&
                    imgIdList.map((imgId: string, idx: number) => (
                        <span key={imgId}>
                            <span
                                onClick={() => handleTagClick(imgId)}
                                className={`py-1 px-2 rounded-lg cursor-pointer ${currentImage?.img_id === imgId ? "bg-purple-600" : "bg-purple-400"}`}
                            >
                                {imgId}
                            </span>
                            {idx !== imgIdList.length - 1 && <span className="text-purple-600">{"->"}</span>}
                        </span>
                    ))}
            </div>

            <Second
                imageUrl={currentView?.url}
                setTexture={setTexture}
                testData={testData}
                currentView={currentView}
                setCurrentView={setCurrentView}
                orgId={orgId}
                userId={userId}
            />
        </div>
    );
};

export default PublicFirst;