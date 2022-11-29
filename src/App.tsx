import Terrain from './components/Terrain';
import { useState } from 'react';
import { useInterval } from 'usehooks-ts';
import BlockStatus from './values/BlockStatus';
import { Button } from 'primereact/button';
import './App.scss';
import { rando } from './utils/rando';
import IBlock from './models/IBlock';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog } from 'primereact/dialog';

function App() {
	const [blocks, setBlocks] = useState<IBlock[]>(
		Array.from({ length: 96 }, () => ({
			id: rando(),
			status: BlockStatus.NOT_PLANTED,
		}))
	);

	const [initialSeeds, setInitialSeeds] = useState<number>(() => rando(1, 500));
	const [seeds, setSeeds] = useState(0);
	const [count, setCount] = useState(0);
	const [water, setWater] = useState(0);
	const [harvestTotal, setHarvestTotal] = useState(0);
	const [fertilizer, setFertilizer] = useState(0);
	const [delay] = useState<number>(1000);
	const [isPlaying, setPlaying] = useState<boolean>(false);
	const [showDialog, setShowDialog] = useState<boolean>(false);
	const [stop, setStop] = useState(true);
	const seedsPerBlock = 10;

	useInterval(
		async () => {
			setBlocks((prevBlocks) => {
				const newBlocks = [...prevBlocks];

				const notPlantedIndex = newBlocks.findIndex(
					(item) => item.status === BlockStatus.NOT_PLANTED
				);
				console.log(
					'Can plant?',
					initialSeeds - seeds,
					initialSeeds - seeds >= seedsPerBlock
				);

				const haveEnoughSeeds = initialSeeds - seeds >= seedsPerBlock;

				if (haveEnoughSeeds && notPlantedIndex !== -1) {
					const notPlanted = newBlocks[notPlantedIndex];
					notPlanted.status = BlockStatus.PLANTED;
					notPlanted.updatedAtCount = count;

					const randSeeds = rando(
						seedsPerBlock - seedsPerBlock * 0.05,
						seedsPerBlock,
						'float'
					);
					const nextSeeds = seeds + randSeeds;

					setSeeds((prevSeeds) =>
						nextSeeds < initialSeeds ? nextSeeds : prevSeeds
					);

					newBlocks[notPlantedIndex] = notPlanted;
				}

				return [...newBlocks];
			});

			setBlocks((prevBlocks) => {
				const newBlocks = [...prevBlocks];

				const plantedBlocks = newBlocks.filter(
					(item) =>
						item.status === BlockStatus.PLANTED &&
						count - (item.updatedAtCount ?? 0) > 10
				);

				if (plantedBlocks.length > 0) {
					const gotWasted = rando(0, 100) > 95;
					const randomPlantedIndex = rando(0, plantedBlocks.length - 1);
					const randomPlanted = plantedBlocks[randomPlantedIndex];
					if (gotWasted) {
						randomPlanted.status = BlockStatus.WASTED;
						randomPlanted.updatedAtCount = count;
						const newBlocksIndex = newBlocks.findIndex(
							(item) => item.id === randomPlanted.id
						);
						newBlocks[newBlocksIndex] = randomPlanted;
					}
				}

				return [...newBlocks];
			});

			setBlocks((prevBlocks) => {
				const newBlocks = [...prevBlocks];

				const wastedBlocks = newBlocks.filter(
					(item) =>
						item.status === BlockStatus.WASTED &&
						count - (item.updatedAtCount ?? 0) > 2
				);

				if (wastedBlocks.length > 0) {
					// 2 fertilizing machines
					for (let i = 0; i < 2; i++) {
						const randomWastedBlockIndex = rando(0, wastedBlocks.length - 1);
						const randomWastedBlock = wastedBlocks[randomWastedBlockIndex];

						if (count - (randomWastedBlock.updatedAtCount ?? 0) < 3) continue;

						randomWastedBlock.status = BlockStatus.FERTILIZED;
						randomWastedBlock.updatedAtCount = count;
						setFertilizer(
							(prevFertilizer) => prevFertilizer + rando(8, 9.5, 'float')
						);
						const newBlocksIndex = newBlocks.findIndex(
							(item) => item.id === randomWastedBlock.id
						);
						newBlocks[newBlocksIndex] = randomWastedBlock;
					}
				}

				return [...newBlocks];
			});

			setBlocks((prevBlocks) => {
				const newBlocks = [...prevBlocks];

				const fertilizedBlocks = newBlocks.filter(
					(item) => item.status === BlockStatus.FERTILIZED
				);

				if (fertilizedBlocks.length > 0) {
					for (let i = 0; i < fertilizedBlocks.length; i++) {
						const fertilizedBlock = fertilizedBlocks[i];
						if (count - (fertilizedBlock.updatedAtCount ?? 0) < 35) continue;

						const gotBetter = rando(0, 100) > 10;

						const newBlocksIndex = newBlocks.findIndex(
							(item) => item.id === fertilizedBlock.id
						);

						if (gotBetter) {
							fertilizedBlock.status = BlockStatus.GROWN_AFTER_FERTILIZATION;

							fertilizedBlock.updatedAtCount = count;
						} else {
							fertilizedBlock.status = BlockStatus.DEAD;
							setHarvestTotal(harvestTotal + seedsPerBlock);
							fertilizedBlock.updatedAtCount = count;
						}

						newBlocks[newBlocksIndex] = fertilizedBlock;
					}
				}
				return [...newBlocks];
			});

			setBlocks((prevBlocks) => {
				const newBlocks = [...prevBlocks];

				const readyToBeWatered = newBlocks.filter((item) =>
					[
						BlockStatus.GROWN_AFTER_FERTILIZATION,
						BlockStatus.FERTILIZED,
						BlockStatus.GROWN,
						BlockStatus.PLANTED,
					].includes(item.status)
				);

				if (readyToBeWatered.length > 0) {
					for (let i = 0; i < readyToBeWatered.length; i++) {
						const block = readyToBeWatered[i];

						if (count - (block.updatedAtCount ?? 0) < 2) continue;
						if (
							block.status === BlockStatus.FERTILIZED &&
							count - (block.wateredAtCount ?? 0) < 6
						)
							continue;

						if (!!block.wateredAtCount && count - block.wateredAtCount < 5)
							continue;

						block.wateredAtCount = count;
						setWater((prevWater) => (prevWater += rando(4, 6.5, 'float')));
						const newBlocksIndex = newBlocks.findIndex(
							(item) => item.id === block.id
						);
						newBlocks[newBlocksIndex] = block;
					}
				}

				return [...newBlocks];
			});

			setBlocks((prevBlocks) => {
				const newBlocks = [...prevBlocks];

				const planted = newBlocks.filter(
					(item) =>
						item.status === BlockStatus.PLANTED &&
						count - (item.updatedAtCount ?? 0) > 30
				);

				if (planted.length > 0) {
					for (let i = 0; i < planted.length; i++) {
						const block = planted[i];
						if (!!!block.wateredAtCount) continue;
						block.status = BlockStatus.GROWN;
						const newBlocksIndex = newBlocks.findIndex(
							(item) => item.id === block.id
						);
						newBlocks[newBlocksIndex] = block;
					}
				}

				return [...newBlocks];
			});

			setCount((prevCount) => prevCount + 1);
			console.log(
				'grown',
				blocks.filter((item) =>
					[BlockStatus.GROWN, BlockStatus.GROWN_AFTER_FERTILIZATION].includes(
						item.status
					)
				).length,
				blocks.filter((item) => item.status !== BlockStatus.NOT_PLANTED).length,
				count
			);

			if (
				blocks.filter((item) =>
					[
						BlockStatus.GROWN,
						BlockStatus.GROWN_AFTER_FERTILIZATION,
						BlockStatus.DEAD,
					].includes(item.status)
				).length ===
				blocks.filter((item) => item.status !== BlockStatus.NOT_PLANTED)
					.length &&
				count > 0
			) {
				setStop(true);
				setShowDialog(true);
				toast.info('Stopped');
			}
		},
		isPlaying && !stop ? delay : null
	);

	return (
		<>
			<div className='py-2 px-8'>
				<Terrain {...{ blocks, count }} />
				<div className='mt-6 grid grid-cols-6 grid-rows-2 gap-x-10 gap-y-4'>
					<Button
						label={isPlaying ? 'Pause' : 'Start'}
						icon={`pi ${isPlaying ? 'pi-pause' : 'pi-play'}`}
						onClick={() => {
							setPlaying((prevPlaying) => !prevPlaying);
							setStop(false);
						}}
						className='row-span-2 self-center'
					/>


					<Dialog header="Simulación terminada" visible={showDialog} style={{ width: '50vw' }} footer={showDialog} >
						<div>
							<p>Total de perdidas : {harvestTotal} semillas</p>
							<p>Agua utilizada: {water.toFixed(2)}L</p>
							<p>Terreno utilizado: {(
								(blocks.filter(
									(block) =>
										![BlockStatus.NOT_PLANTED, BlockStatus.DEAD].includes(
											block.status
										)
								).length *
									100) /
								blocks.length
							).toFixed(2)}
								%</p>
							<p>Fertilizantes y abonos utilizados : {fertilizer.toFixed(2)}L</p>
						</div>
						<br />
						<Button
							label={"Reiniciar"} icon={`pi pi-refresh`}
							className='row-span-2 self-center' onClick={() => { location.reload(); }}
						/>
					</Dialog>
					<div className=''>
						<p className='facts-title'>D&iacute;a</p>
						<p className='facts-subtitle'>{count + 1}</p>
					</div>
					<div className=''>
						<p className='facts-title'>Semillas compradas:</p>
						<p className='facts-subtitle'>{initialSeeds} kg</p>
					</div>
					<div className=''>
						<p className='facts-title'>Semillas sembradas:</p>
						<p className='facts-subtitle'>{seeds.toFixed(2)} kg</p>
					</div>
					<div className=''>
						<p className='facts-title'>Terreno sembrado:</p>
						<p className='facts-subtitle'>
							{(
								(blocks.filter(
									(block) =>
										![BlockStatus.NOT_PLANTED, BlockStatus.DEAD].includes(
											block.status
										)
								).length *
									100) /
								blocks.length
							).toFixed(2)}
							%
						</p>
					</div>

					<div className=''>
						<p className='facts-title'>Terreno fertilizado:</p>
						<p className='facts-subtitle'>
							{(
								(blocks.filter(
									(block) => block.status === BlockStatus.FERTILIZED
								).length *
									100) /
								blocks.length
							).toFixed(2)}
							%
						</p>
					</div>
					<div className=''>
						<p className='facts-title'>Agua utilizada:</p>
						<p className='facts-subtitle'>{water.toFixed(2)}L</p>
					</div>
					<div className=''>
						<p className='facts-title'>Fertilizante utilizado:</p>
						<p className='facts-subtitle'>{fertilizer.toFixed(2)}L</p>
					</div>
				</div>
			</div>
			<ToastContainer />
		</>
	);
}

export default App;

