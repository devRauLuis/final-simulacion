import BlockStatus from '../values/BlockStatus';

export default interface IBlock {
	status: BlockStatus;
	id: number;
	updatedAtCount?: number;
	wateredAtCount?: number;
}

