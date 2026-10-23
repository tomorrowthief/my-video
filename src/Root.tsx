import "./index.css";
import { DreamCompositions } from "./dream/DreamStory";
import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { NNAvatar, NNEnergy } from "./nn/NNEnergy";
import { AVATAR, MAIN } from "./nn/scenes";
import { VIDEOS, type VideoDef } from "./videos";
import { CarCompositions } from "./car/CarEnergyFlow";
import { IdiomCompositions } from "./idioms/SeedlingStory";
import { StumpCompositions } from "./idiom-stump/StumpStory";
import { FoxCompositions } from "./fable/FoxStory";
import { PlumCompositions } from "./history/PlumStory";
import { AnatomyCompositions } from "./anatomy/MotorAnatomy";
import { NetworkExplainerComposition } from "./nn/NetworkExplainer";

/** Videos grouped into the Studio sidebar folders they declare, in registry order. */
const byFolder = (): readonly (readonly [string, readonly VideoDef[]])[] => {
	const folders: string[] = [];
	for (const video of VIDEOS) {
		if (!folders.includes(video.folder)) folders.push(video.folder);
	}
	return folders.map(
		(folder) => [folder, VIDEOS.filter((video) => video.folder === folder)] as const,
	);
};

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<DreamCompositions />
			<AnatomyCompositions />
			<Folder name="NeuralNetwork"><NetworkExplainerComposition /></Folder>
			<CarCompositions />
			<IdiomCompositions />
			<StumpCompositions />
			<FoxCompositions />
			<PlumCompositions />
			{byFolder().map(([folder, videos]) => (
				<Folder key={folder} name={folder}>
					{videos.map((video) => (
						<Composition
							key={video.title}
							id={video.title}
							component={video.Component}
							durationInFrames={video.timing.totalFrames}
							fps={video.timing.fps}
							width={video.timing.width}
							height={video.timing.height}
						/>
					))}
				</Folder>
			))}
			{/* 氛围循环。不进 VIDEOS 注册表：那个表是"带旁白的解说视频"的表，
			    它的 defineVideo 强制要求 narration + timing + 音频三件套。 */}
			<Folder name="Ambient">
				<Composition
					id="NNEnergy"
					component={NNEnergy}
					durationInFrames={MAIN.durationInFrames}
					fps={MAIN.fps}
					width={MAIN.width}
					height={MAIN.height}
				/>
				{/* 方形变体，给 GIF / 头像用。尺寸和帧率都来自 AVATAR，不在这里重复写。 */}
				<Composition
					id="NNAvatar"
					component={NNAvatar}
					durationInFrames={AVATAR.durationInFrames}
					fps={AVATAR.fps}
					width={AVATAR.width}
					height={AVATAR.height}
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
