import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html, useAnimations } from "@react-three/drei";

function Model({ isSpeaking }) {
    // Note: The user named the avatar file 'background.glb' and the classroom 'avatar.glb'
    const group = useRef();
    const { scene } = useGLTF("/background.glb");
    const { animations } = useGLTF("/animatio.glb");
    const { actions } = useAnimations(animations, group);
    const headMeshRef = useRef(null);

    useEffect(() => {
        if (!scene) return;
        scene.traverse((node) => {
            // Find the head mesh with morph targets
            if (node.isMesh && node.morphTargetDictionary) {
                headMeshRef.current = node;
            }
        });
    }, [scene]);

    // ANIMATION CONTROLLER
    useEffect(() => {
        if (!actions) return;
        
        const actionNames = Object.keys(actions);
        console.log("Available animations loaded from animatio.glb:", actionNames);
        
        if (actionNames.length === 0) return;

        let animName = "";
        
        if (isSpeaking) {
            // Try to find a talking animation, otherwise pick the second animation (or fallback to first)
            animName = actionNames.find(n => n.toLowerCase().includes('talk') || n.toLowerCase().includes('speak')) || actionNames[1] || actionNames[0];
        } else {
            // Try to find an idle animation, otherwise pick the first animation
            animName = actionNames.find(n => n.toLowerCase().includes('idle') || n.toLowerCase().includes('rest')) || actionNames[0];
        }

        if (actions[animName]) {
            actions[animName].reset().fadeIn(0.5).play();
            return () => {
                actions[animName].fadeOut(0.5);
            };
        }
    }, [isSpeaking, actions]);

    // LIPSYNC ANIMATION
    useFrame((state) => {
        if (!headMeshRef.current) return;

        const dict = headMeshRef.current.morphTargetDictionary;
        const influences = headMeshRef.current.morphTargetInfluences;

        if (!dict || !influences) return;

        const ahIndex = dict["AH"];
        const ohIndex = dict["OH"];

        if (ahIndex !== undefined && ohIndex !== undefined) {
            if (isSpeaking) {
                // Generate rapid mouth movement using sine waves
                const time = state.clock.elapsedTime;

                // Modulate mouth opening (0.2 to 1.0)
                const mouthOpen = (Math.sin(time * 20) * 0.4 + 0.6);

                // Alternate between AH (wide) and OH (round) randomly
                const isOH = Math.sin(time * 12) > 0;

                influences[ahIndex] = isOH ? 0 : mouthOpen;
                influences[ohIndex] = isOH ? mouthOpen : 0;
            } else {
                // Smoothly close mouth
                influences[ahIndex] *= 0.8;
                influences[ohIndex] *= 0.8;
            }
        }
    });

    // Increased scale and adjusted position so legs are visible and touching the floor
    return (
        <group ref={group} dispose={null}>
            <primitive object={scene} scale={1.1} position={[-1, -0.9, -0.5]} rotation={[0, 0.4, 0]} />
        </group>
    );
}

function BackgroundModel({ summary, highlightData }) {
    const { scene } = useGLTF("/avatar.glb");

    let renderedText = summary;
    if (highlightData && highlightData.text && highlightData.index >= 0) {
        const { text, index, length } = highlightData;
        const before = text.substring(0, index);
        const highlighted = text.substring(index, index + length);
        const after = text.substring(index + length);

        renderedText = (
            <>
                {before}
                <span style={{ backgroundColor: 'rgba(110, 231, 183, 0.4)', color: '#fff', borderRadius: '4px', padding: '0 2px' }}>
                    {highlighted}
                </span>
                {after}
            </>
        );
    } else if (highlightData && highlightData.text) {
        renderedText = highlightData.text; // Clean text without markdown
    } else if (summary) {
        // Fallback to strip markdown if not speaking yet
        renderedText = summary.replace(/[*_#`~>=-]/g, '');
    }

    // Scale and position might need tweaks depending on the user's specific 3D model
    return (
        <group position={[0, -1, 0]}>
            <primitive object={scene} scale={1} />
            {summary && (
                <Html
                    transform
                    position={[0, 1.8, -2.5]}
                    distanceFactor={1.5}
                    className="board-summary-html"
                >
                    <div className="board-content">
                        <h3>Lecture Summary</h3>
                        <div className="board-text">{renderedText}</div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function Avatar({ isSpeaking, summary, highlightData }) {
    return (
        <div className="avatar-container">
            <Canvas camera={{ position: [0, 1.5, 2], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <BackgroundModel summary={summary} highlightData={highlightData} />
                    <Model isSpeaking={isSpeaking} />
                </Suspense>

                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                />
            </Canvas>
        </div>
    );
}

export default Avatar;
