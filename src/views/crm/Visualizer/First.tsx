//First.tsx

// @ts-nocheck

import React, { useEffect, useState, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Html, useProgress, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import classNames from 'classnames';
import { apiDeleteCrmMainImage, apiGetCrmImageById, apiGetCrmMainThreeImage, apiGetCrmPanoImagesFileManager, apiPostCrmThreeImage } from "@/services/CrmService";
import { AnyAaaaRecord } from "node:dns";
import { Avatar, Input, Notification, Select, toast } from "@/components/ui";
import { useSearchParams } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
import { ConfirmDialog } from "@/components/shared";
import { HiOutlineExclamation } from "react-icons/hi";
import Loading from "react-loading";
import Project from "../CrmDashboard/components/Projects";

const Loader = () => {
  const queryParams = new URLSearchParams(location.search);
  const imgId = queryParams.get("imgId") || "";

  return (
    <Html center zIndexRange={[0, 0]} style={{ pointerEvents: "none" }}>
      {!imgId ? (
        <div className="flex text-white bg-gray-800 h-[36.9rem] items-center justify-center w-[58rem] rounded-lg border-2">
          <span>Select or Import an image!</span>
        </div>
      ) : (
        <div className="flex h-[36.9rem] bg-gray-800 items-center justify-center w-[58rem] border-2">
          <Loading type="bubbles" color="#3498db" height={100} width={100} />
        </div>
      )}
    </Html>
  );
};

function Box(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<any>()
  const textRef = useRef();
  // Hold state for hovered and clicked events
  // const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  const { gl, camera  } = useThree();
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    ref.current.rotation.x += delta;

    // Make text always face the camera
    if (textRef.current) {
      textRef.current.lookAt(camera.position);
    }
  });
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <group onClick={props.handleClick}>
      {true && (
        <Html zIndexRange={[0, 0]} position={[0, 15, 0]} center>
        <div
          style={{
            color:  props?.hovered ? 'black' : 'purple',
            // background: "black",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "14px",
            whiteSpace: "nowrap",
            textAlign: "center",
            zIndex: -1,
            transform: "translate(-50%, -100%)",
          }}
        >
          {props?.name}
        </div>
      </Html>
      )}

    <mesh
      {...props}
      ref={ref}
      scale={props?.hovered ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => {props?.hover(true); gl.domElement.style.cursor = "pointer";}}
      onPointerOut={(event) => {props?.hover(false); gl.domElement.style.cursor = "auto";}}
      >
      <torusGeometry args={[10, 1, 80, 100]} />
      <meshStandardMaterial color={props?.hovered ? 'black' : 'white'} />
    </mesh>

    </group>
  )
}

const Hotspot = ({ data, setCurrentView }) => {
  const [hovered, hover] = useState(false);
  const [delhovered, delhover] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [toDeleteId, setToDeleteId] = useState('')
  const { gl } = useThree();

  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id') || '';
  const projectId = queryParams.get('project_id') || '';
  const org_id = localStorage.getItem('orgId')

  // console.log(data)

  const [dialogIsOpen2, setIsOpen2] = useState(false)
  const openDialog2 = (imgId:any) => {
      setIsOpen2(true)
      setToDeleteId(imgId)
    }

    const onDialogClose2 = () => {
      setIsOpen2(false)
    }

    const hanldleDelete = async (img_id:any) => {

      // console.log(img_id)
      try {

        const  data = {
          lead_id: leadId,
          project_id: projectId,
          img_id: img_id,
          type: "hp",
          org_id: org_id,
        }

        const  response =  await apiDeleteCrmMainImage(data);


        if (response.code === 200) {
          toast.push(
            <Notification closable type="success" duration={2000}>
              Image Deleted successfully
            </Notification>, { placement: 'top-end' }
          )

          window.location.reload();
        }
        else {
          toast.push(
            <Notification closable type="danger" duration={2000}>
              {response.errorMessage}
            </Notification>, { placement: 'top-end' }
          )
        }
        
      } catch (error:any) {

        throw new Error(error)
        
      }
    }
  
  const position = new THREE.Vector3(data?.crd[0], data?.crd[1], data?.crd[2]);

  const handleClick = () => {
    setCurrentView(data);
    const updatedParams = new URLSearchParams(searchParams);

    // Get the current mainId
    const prevMainId = updatedParams.get("imgId");

    // Set the new mainId
    updatedParams.set("imgId", data.img_id);

    // If there was a previous mainId, append it in order
    if (prevMainId) {
      const paramIndex = updatedParams.size; // Get next index (1-based)
      updatedParams.set(paramIndex.toString(), prevMainId);
    }
    setSearchParams(updatedParams);
  };

  return (

    <>
    <group position={position}>
      {/* Eccentric Sphere */}
      <mesh
        onClick={handleClick}
        scale={[1.5, 1.8, 1.2]}
        onPointerOver={() => { hover(true); gl.domElement.style.cursor = "pointer"; }}
        onPointerOut={() => { hover(false); gl.domElement.style.cursor = "auto"; }}
        castShadow
      >
        <sphereGeometry args={[5, 32, 32]} />
        <Box position={[1.2, 0, 0]} data={data} name={data?.name} hovered={hovered} hover={hover} handleClick={handleClick} />
        <meshStandardMaterial color={hovered ? 'white' : 'purple'} />
      </mesh>

      {/* Button below the sphere */}
      <Html zIndexRange={[0, 0]} position={[-10, -27, 0]}
      >
        <div 
          style={{
            // background: hovered ? "black" : "white",
            color: delhovered ? "white" : "black",
            border: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.3)"
          }}
          onClick={() => openDialog2(data?.img_id)}
          onMouseEnter={() => delhover(true)}
          onMouseLeave={() => delhover(false)}
        >
          <MdDeleteOutline/>
        </div>
      </Html>
    </group>

    {dialogIsOpen2 && (
      <Html>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-10">
        <div className="bg-white pt-10 rounded-lg shadow-lg ">


          <div className="flex items-start w-[33rem] gap-4 ml-6">
            <Avatar
                className="text-red-600 bg-red-100 dark:bg-red-600 dark:text-red-100"
                shape="circle"
            >
                <span className="text-2xl">
                    <HiOutlineExclamation />
                </span>
            </Avatar>

            <div className="flex flex-col gap-2">
              <div className="font-semibold text-black text-lg">Delete Hotspot</div>
              <div>Are you sure want to delete this hotspot?</div>
            </div>

          </div>
      
          <div className="flex justify-end mt-4 w-full bg-[#F3F4F6] rounded-lg">
            <button
              onClick={() => onDialogClose2()}
              className="bg-white text-black border-[0.08rem] border-gray-300 px-4 py-2 mr-2 rounded mb-3 mt-3"
            >
              Cancel
            </button>
            <button
              onClick={() => hanldleDelete(data.img_id)}
              className="bg-[#EF4444] text-white px-4 py-2 rounded mb-3 mt-3 mr-2"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      </Html>
      )}

    </>
  );
};


const Scene = ({ texture, addThisHp, addHotspotMode, onHotspotAdd, testData, setCurrentView, currentView }: any) => {
  const { camera, scene, gl } = useThree();
  const [hotspots, setHotspots] = useState<any>(currentView?.hp);
  const [hpLoading, setHpLoading] = useState<any>(false);
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id') || null;
  const projectId = queryParams.get('project_id') || null;

  useEffect(() => {
    setHotspots(currentView?.hp)
  }, [currentView])  

  useEffect(() => {
    const fetchData = async() => {
      try {
        setHpLoading(false);
        const res = await apiGetCrmMainThreeImage('hp', currentView.img_id, leadId, projectId);

        setHotspots(res?.data[0]?.hp)
        setHpLoading(true);
      } catch (error:any) {
        throw new Error(error);
      }
    }
    fetchData()
  }, [currentView])
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Handle click inside the component
  const handleClick = async (event: any) => {
    try {
      if (!addHotspotMode) return;
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children);
      
      if (intersects.length > 0) {
        const point = intersects[0].point;
        onHotspotAdd(point);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <>
      <group onClick={handleClick}>
        <OrbitControls enableZoom enablePan={false} minDistance={50} maxDistance={100} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {texture && (
          <mesh>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
          </mesh>
        )}
        {hpLoading && texture && hotspots && hotspots?.map((data: any, index: any) => (
            <Hotspot key={index} data={data} setCurrentView={setCurrentView} />
        ))}
      </group>
    </>
  );
};


const CameraZoom = ({ zoomTarget, zooming }: any) => {
    const { camera, gl } = useThree();
    
    // Use frame hook to animate the zoom effect
    useFrame(() => {
      if (zooming) {
        // Animate camera zoom towards target (using camera.zoom, not position)
        camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoomTarget, 0.1);  // Smooth zoom transition
        camera.updateProjectionMatrix(); // Update the projection matrix
      } else {
        // Reset to normal zoom
        camera.zoom = THREE.MathUtils.lerp(camera.zoom, 1, 0.1);  // Smooth reset
        camera.updateProjectionMatrix();
      }
    });
  
    return null;  // This component just handles camera zoom animation
  };

const Second = ({texture, setTexture, imageUrl, addHotspotMode, onHotspotAdd, testData, setCurrentView, currentView }:any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rename, setRename] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [addThisHp, setAddThisHp] = useState<any>(null);
  const [panoImages, setPanoImages] = useState<any>([])

  const [zooming, setZooming] = useState(false);  // Track zoom transition state
  const [zoomTarget, setZoomTarget] = useState(1);

  const user_id = localStorage.getItem('userId')
  const org_id = localStorage.getItem('orgId')
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id') || null;
  const projectId = queryParams.get('project_id') || null;

  // useEffect(() => {
  //   console.log('aaaaaaa')
  //   const textureLoader = new THREE.TextureLoader();
  //   textureLoader.load(imageUrl, (loadedTexture:any) => {
  //     loadedTexture.wrapS = THREE.RepeatWrapping;
  //     loadedTexture.wrapT = THREE.RepeatWrapping;
  //     loadedTexture.repeat.x = -1;
  //     setTexture(loadedTexture);
  //     console.log('ccccccc')
  //   });

  //   console.log('bbbbbbbb')
  // }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl) return;
  
    setTexture(null); // Reset texture to force update
  
    const textureLoader = new THREE.TextureLoader();
    const compressImage = (blob, quality = 0.7) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
    
          // Set new dimensions (optional)
          const MAX_WIDTH = 4096;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
    
          // Draw and compress
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (compressedBlob) => {
              resolve(compressedBlob);
            },
            "image/webp", // Convert to WebP format
            quality // Compression quality
          );
        };
        img.onerror = reject;
      });
    };
  
    // Function to fetch and compress the image
    const fetchAndCompressImage = async () => {
      try {
        console.log("Fetching image for compression...");
  
        const response = await fetch(imageUrl);
        const blob = await response.blob();
  
        // Convert to WebP (compressed format)
        const compressedBlob = await compressImage(blob, 0.4); // 60% quality
  
        // Convert to Object URL
        const compressedUrl = URL.createObjectURL(compressedBlob);
        console.log("Compressed Image URL:", compressedUrl);
  
        // Load compressed texture
        textureLoader.load(
          compressedUrl,
          (loadedTexture) => {
            loadedTexture.wrapS = THREE.RepeatWrapping;
            loadedTexture.wrapT = THREE.RepeatWrapping;
            loadedTexture.repeat.x = -1;
            setTexture(loadedTexture);
            console.log("Compressed texture loaded.");
          },
          undefined,
          (error) => {
            console.error("Error loading compressed texture:", error);
          }
        );
      } catch (error) {
        console.error("Error fetching or compressing image:", error);
      }
    };
  
    fetchAndCompressImage();
  }, [imageUrl]);

  

  useEffect(() => {
  
      const fetchData = async () => {
  
        const res = await apiGetCrmPanoImagesFileManager(leadId, projectId);
  
        const panoImg = res.data?.files
        setPanoImages(panoImg)
  
      }
      fetchData()
  
    }, [leadId, projectId])

  useEffect(() => {
    setZooming(true);
    setZoomTarget(1.2);  // Adjust zoom factor as needed

    setTimeout(() => {
      setZooming(false);
      setZoomTarget(1);  // Reset zoom to normal
    }, 1000); // Match this duration with the zoom transition time
  }, [currentView]);

  const handleSubmit = async () => {
    if (!file || !name || !selectedPoint) return;

    const formData = {
      org_id: org_id,
      user_id: user_id,
      lead_id: leadId? leadId : null,
      project_id: projectId? projectId : null,
      type: 'hp',
      main_img_id: currentView.img_id,
      url: file,
      name: name,
      rename: rename,
      crd: [selectedPoint.x, selectedPoint.y, selectedPoint.z],
      hp: [],
    };
    
    try {
      const res = await apiPostCrmThreeImage(formData);
      // console.log(res);
      onHotspotAdd(selectedPoint);
      setAddThisHp(formData)
      setDialogOpen(false);

      window.location.reload();

      
    } catch (error) {
      console.error("Error adding hotspot:", error);
    }
  };

  return (
    <>
      <Canvas style={{ height: "75vh" }} onClick={(event) => event.stopPropagation()}>
        {/* <Scene texture={texture} currentView={currentView} setCurrentView={setCurrentView} addHotspotMode={addHotspotMode} onHotspotAdd={onHotspotAdd} testData={testData} /> */}
        <CameraZoom zoomTarget={zoomTarget} zooming={zooming} />
        <Scene
            texture={texture}
            currentView={currentView}
            setCurrentView={setCurrentView}
            addHotspotMode={addHotspotMode}
            addThisHp={addThisHp}
            onHotspotAdd={(point) => {
              setSelectedPoint(point);
              setDialogOpen(true);
            }}
            testData={testData}
          />
        {!texture && <Loader />}
      </Canvas>

      {dialogOpen && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-10">
        <div className="bg-white p-6 rounded shadow-lg">
          <h2 className="text-xl font-bold mb-4">Add Hotspot</h2>
      
          {/* Dropdown Input */}
          <label className="block mb-2">
            Image:
            <Select
              options={panoImages.map((files: any) => ({
                value: files.fileUrl,
                label: files.fileName,
              }))}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setFile(selectedOption.value);
                  setName(selectedOption.label);
                }
              }}
              className="border p-2 w-full"
            />
          </label>

          <label className="block mb-2">
            Rename:
            <Input
              type="text"
              onChange={(e) => setRename(e.target.value)}
              className="border p-2 w-full"
            />
        </label>
      
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setDialogOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 mr-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      )}
    
    </>
  );
};

const First = ({imgIdList, currentImage, setCurrentImage, setImgList}:any) => {

console.log(currentImage)

const queryParams = new URLSearchParams(location.search);
const leadId = queryParams.get('lead_id') || null;
const projectId = queryParams.get('project_id') || null;
const imgId = queryParams.get('imgId') || '';

const [testData, setTestData] = useState<any>(currentImage)
const [texture, setTexture] = useState(null);
const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  const fetchData = async () => {
    const res = await apiGetCrmImageById(imgId, leadId, projectId)

    const paramEntries = Array.from(searchParams.entries());

      // Filter out imgId and lead_id
      const idParams = paramEntries
        .filter(([key]) => key !== "imgId" && key !== "lead_id" && key !== "project_id") // Exclude lead_id
        .sort(([a], [b]) => Number(a) - Number(b)) // Sort numerically
        .map(([, value]) => value);

      // Append imgId at the end if it exists
      const imgId2 = searchParams.get("imgId");
      if (imgId2) idParams.push(imgId2);
      console.log(idParams)

      setImgList(idParams)

        setTestData(res?.data[0])
        setCurrentImage(res?.data[0])
      };

  fetchData();
}, [imgId]);




  const [currentView, setCurrentView] = useState<any>({});

  useEffect(() => {

    setCurrentView(currentImage);

  }, [currentImage])
  const [addHotspotMode, setAddHotspotMode] = useState<any>(false);
  const [hotspots, setHotspots] = useState<any>([]);

  const handleHotspotAdd = (point:any) => {
    setHotspots([...hotspots, point]);
  };

  const handleTagClick = (clickedImgId: string) => {
    setImgList((prev: string[]) => {
      const index = prev.indexOf(clickedImgId);
      return index !== -1 ? prev.slice(0, index + 1) : [...prev, clickedImgId];
    });
  
    // Create a new URLSearchParams instance
    const updatedParams = new URLSearchParams(searchParams);
    const updatedParams2 = new URLSearchParams();
  
    // Set the new mainId
    if(leadId) {
      updatedParams2.set("lead_id", leadId);
    } else if(projectId) {

      updatedParams2.set("project_id", projectId);
    }
  
    let indexedParams: { index: number; value: string }[] = [...updatedParams.entries()]
      .filter(([key]) => !isNaN(Number(key)) && Number(key) >= 2)
      .map(([key, value]) => ({ index: Number(key), value }))
      .sort((a, b) => a.index - b.index); // Ensure correct order
  
    // Extract values into a list
    let extractedList = indexedParams.map((item) => item.value);
  
    // Find the position of the clicked ID in the extracted list
    const index = extractedList.indexOf(clickedImgId);
    if (index !== -1) {
      extractedList = extractedList.slice(0, index + 1); // Trim the list
    } else {
      extractedList.push(clickedImgId);
    }

    extractedList.slice(0, -1).forEach((item, index) => {
      updatedParams2.set((index + 2).toString(), item);
    });

    // Explicitly add the last one as imgId
    updatedParams2.set("imgId", extractedList[extractedList.length - 1]);
    setImgList(extractedList);
    setSearchParams(updatedParams2);
  };

  return (

      <div className="w-[70%] relative">

        <div className='flex  text-white px-4 py-2 rounded z-10'>

        {imgId &&
          imgIdList?.map((imgId:any, idx:any) => {

            return <span>
              <span onClick={() => handleTagClick(imgId)} className={`py-1 px-2 rounded-lg cursor-pointer ${currentImage?.img_id === imgId ? "bg-purple-600" : "bg-purple-400"}`}>{imgId}</span>

              {idx != imgIdList?.length-1 && <span className="text-purple-600">{"->"}</span>}
            </span>


          })
        }

        </div>

          {addHotspotMode && (
            <div className="absolute inset-0 mt-[2.24rem] bg-black bg-opacity-50 z-10  pointer-events-none" />
          )}

      
          {texture && <button
            onClick={() => setAddHotspotMode(!addHotspotMode)}
            className="absolute top-12 right-4 bg-blue-500 text-white px-4 py-2 rounded z-10"
          >
            {addHotspotMode ? "Stop Adding Hotspots" : "Add Hotspot"}
          </button>}

          

        <Second texture={texture} setTexture={setTexture} imageUrl={currentView?.url} currentView={currentView} setCurrentView={setCurrentView} testData={testData} addHotspotMode={addHotspotMode} onHotspotAdd={handleHotspotAdd} />
      </div>
    
  );
};

export default First;
