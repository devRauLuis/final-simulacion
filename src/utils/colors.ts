import BlockStatus from '../values/BlockStatus';

export const getBlockColor = (status: BlockStatus) => {
	switch (status) {
		case BlockStatus.PLANTED:
			return 'bg-yellow-600';

		case BlockStatus.NOT_PLANTED:
			return 'bg-yellow-900';

		case BlockStatus.GROWN:
			return 'bg-green-700';

		case BlockStatus.GROWN_AFTER_FERTILIZATION:
			return 'bg-green-900';

		case BlockStatus.FERTILIZED:
			return 'bg-blue-900';

		case BlockStatus.WASTED:
			return 'bg-red-900';

		case BlockStatus.DEAD:
		default:
			return 'bg-black';
	}
};

