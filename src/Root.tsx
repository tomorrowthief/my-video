import "./index.css";
import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { VIDEOS, type VideoDef } from "./videos";

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
