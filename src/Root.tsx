import "./index.css";
import { Composition, Folder } from "remotion";
import { ChickenRabbit, CR_TOTAL_FRAMES } from "./ChickenRabbit";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { PiDurable, TOTAL_FRAMES } from "./PiDurable";
import { PythonRoadmap, PY_FPS, PY_TOTAL_FRAMES } from "./PythonRoadmap";

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="Explainer">
				<Composition
					id="PiDurable"
					component={PiDurable}
					durationInFrames={TOTAL_FRAMES}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="PythonRoadmap"
					component={PythonRoadmap}
					durationInFrames={PY_TOTAL_FRAMES}
					fps={PY_FPS}
					width={1920}
					height={1080}
				/>
			</Folder>
			<Folder name="Math">
				<Composition
					id="ChickenRabbit"
					component={ChickenRabbit}
					durationInFrames={CR_TOTAL_FRAMES}
					fps={30}
					width={1920}
					height={1080}
				/>
			</Folder>
			<Folder name="Elements">
				<Composition
					id="Logo"
					component={Logo}
					durationInFrames={150}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						logoColor1: "#91EAE4",
						logoColor2: "#86A8E7",
					}}
				/>
				<Composition
					id="Title"
					component={Title}
					durationInFrames={115}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						titleText: "Welcome to Remotion",
						titleColor: "#000000",
					}}
				/>
			</Folder>
			<Composition
				id="HelloWorld"
				component={HelloWorld}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					titleText: "Welcome to Remotion",
					titleColor: "#000000",
				}}
			/>
		</>
	);
};