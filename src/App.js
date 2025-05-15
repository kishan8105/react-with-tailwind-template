import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import _ from 'lodash';

export default function CodeSubmissionApp() {
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sceneInitialized, setSceneInitialized] = useState(false);
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubesRef = useRef([]);
  const frameIdRef = useRef(null);
  
  // Handle form submission
  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      if (code === 'acess_420') {
        setSubmitted(true);
        setError('');
      } else {
        setError('Invalid code. Please try again.');
        setSubmitted(false);
      }
      setLoading(false);
    }, 1500);
  };
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || sceneInitialized) return;
    
    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create animated background cubes
    const cubes = [];
    for (let i = 0; i < 50; i++) {
      const geometry = new THREE.BoxGeometry(
        Math.random() * 0.5 + 0.1,
        Math.random() * 0.5 + 0.1,
        Math.random() * 0.5 + 0.1
      );
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(
          0.5 + Math.random() * 0.5,
          0.5 + Math.random() * 0.5,
          0.9 + Math.random() * 0.1
        ),
        transparent: true,
        opacity: 0.7,
        wireframe: true
      });
      
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      cube.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      cube.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01
        },
        moveSpeed: {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.005,
          z: (Math.random() - 0.5) * 0.005
        }
      };
      
      scene.add(cube);
      cubes.push(cube);
    }
    cubesRef.current = cubes;
    
    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation function
    const animate = () => {
      cubesRef.current.forEach((cube) => {
        cube.rotation.x += cube.userData.rotationSpeed.x;
        cube.rotation.y += cube.userData.rotationSpeed.y;
        cube.rotation.z += cube.userData.rotationSpeed.z;
        
        cube.position.x += cube.userData.moveSpeed.x;
        cube.position.y += cube.userData.moveSpeed.y;
        cube.position.z += cube.userData.moveSpeed.z;
        
        // Bounds checking to keep cubes in view
        if (Math.abs(cube.position.x) > 15) cube.userData.moveSpeed.x *= -1;
        if (Math.abs(cube.position.y) > 15) cube.userData.moveSpeed.y *= -1;
        if (Math.abs(cube.position.z) > 15) cube.userData.moveSpeed.z *= -1;
      });
      
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    setSceneInitialized(true);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      cubesRef.current.forEach((cube) => {
        cube.geometry.dispose();
        cube.material.dispose();
        scene.remove(cube);
      });
    };
  }, [sceneInitialized]);
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Three.js container */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full z-0"
      />
      
      {/* Content overlay */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-center text-white mb-8 tracking-tight">
            Code Verification System
          </h1>
          
          {!submitted ? (
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2 transition-all duration-300">
                  Enter Access Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="Enter your code here"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform transition-all duration-300 w-0 group-hover:w-full" />
                </div>
              </div>
              
              {error && (
                <div className="text-red-400 text-sm px-4 py-2 bg-red-900/20 rounded-lg border border-red-800/50 animate-pulse">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full relative overflow-hidden py-3 px-4 rounded-lg text-white font-medium transition duration-300 ${
                  loading 
                    ? 'bg-blue-800 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : null}
                  {loading ? 'Verifying...' : 'Submit'}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-900/30 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-300 font-medium">Code verified successfully!</p>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-6 bg-white/5 backdrop-blur-sm">
                <h2 className="text-lg font-medium text-gray-300 mb-3">Your Access Link:</h2>
                <a
                  href="https://drive.google.com/drive/folders/1RfvV5PMPzSQurSSEI8wBw7joYhgSdGmL"
                  className="text-blue-400 hover:text-blue-300 break-all block p-4 bg-black/30 rounded-lg border border-blue-900/50 transition-colors duration-300"
                >
                  Click here to acess your files
                </a>
              </div>
              
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCode('');
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 border border-gray-600"
              >
                Enter Another Code
              </button>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <div className="inline-flex h-1 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <p className="text-gray-400 text-xs mt-4">Secured with advanced encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}