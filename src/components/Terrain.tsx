import IBlock from '../models/IBlock';
import { getBlockColor } from '../utils/colors';
import { FaWater } from 'react-icons/fa';

interface TerrainProps {
	blocks: IBlock[];
	count: number;
}

const Terrain: React.FunctionComponent<TerrainProps> = ({ blocks, count }) => {
	return (
		<div className='grid grid-cols-12 gap-1'>
			{blocks.map((item, i) => {
				return (
					<div
						className={`${getBlockColor(
							item.status
						)} h-18 flex flex-col justify-center items-center text-white text-xs p-2 `}>
						<p className=''>{i + 1}</p>
						<p className=''>{item.status}</p>
						{!!item.wateredAtCount && count - item.wateredAtCount < 4 && (
							<FaWater />
						)}
					</div>
				);
			})}
		</div>
	);
};

export default Terrain;

