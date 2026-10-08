import "./index.css";
import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { PiDurable, TOTAL_FRAMES } from "./PiDurable";

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