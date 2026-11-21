import React from 'react';
import {Composition} from 'remotion';
import capsules from './capsules.json';
import timings from './timings.json';
import {Capsule, FPS, Meta, totalSecs} from './lib';
import {SCENES} from './scenes';

export const RemotionRoot: React.FC = () => (
	<>
		{(capsules as Meta[]).map((m0) => {
			// Tiempos ajustados a la locución (python/tts.py), si existen.
			const t = (timings as Record<string, number[]>)[m0.id];
			const m: Meta = t && t.length === m0.beats.length ? {...m0, beats: m0.beats.map((b, i) => ({...b, secs: t[i]}))} : m0;
			return (
			<Composition
				key={m.id}
				id={`c${m.id.replace(/[.]/g, '-')}`}
				component={() => <Capsule meta={m} Scene={SCENES[m.id]} />}
				durationInFrames={Math.round(totalSecs(m) * FPS)}
				fps={FPS}
				width={1920}
				height={1080}
			/>
			);
		})}
	</>
);
