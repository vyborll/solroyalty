import { useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

import useCollection from '@/store/useCollection';
import usePagination from '@/store/usePagination';
import api from '@/utils/api';

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
const DOTS = '...';

const Pagination = () => {
	const { page, maxPages, setPagination } = usePagination();
	const { collection, buyer, paid, setCollections } = useCollection();

	const onPageChange = async (page: number) => {
		await getSales(page);
	};

	const getSales = async (page: number) => {
		const res = await api.get('/collections/sales', {
			params: {
				symbol: collection?.symbol,
				page,
				...(paid === 'Paid' ? { paid: true } : paid === 'Unpaid' ? { paid: false } : undefined),
				...(buyer && buyer !== '' ? { buyer } : undefined),
			},
		});
		setCollections({ sales: res.data.sales });
		setPagination({ page: res.data.page, maxPages: res.data.maxPages });
	};

	const paginationRange = useMemo(() => {
		let siblingCount = 1;

		const totalPageNumbers = siblingCount + 5;

		if (totalPageNumbers >= maxPages) {
			return range(1, maxPages);
		}

		const leftSiblingIndex = Math.max(page - siblingCount, 1);
		const rightSiblingIndex = Math.min(page + siblingCount, maxPages);

		const shouldShowLeftDots = leftSiblingIndex > 2;
		const shouldShowRightDots = rightSiblingIndex < maxPages - 2;

		const firstPageIndex = 1;
		const lastPageIndex = maxPages;

		if (!shouldShowLeftDots && shouldShowRightDots) {
			let leftItemCount = 3 + 2 * siblingCount;
			let leftRange = range(1, leftItemCount);

			return [...leftRange, DOTS, maxPages];
		}

		if (shouldShowLeftDots && !shouldShowRightDots) {
			let rightItemCount = 3 + 2 * siblingCount;
			let rightRange = range(maxPages - rightItemCount + 1, maxPages);
			return [firstPageIndex, DOTS, ...rightRange];
		}

		if (shouldShowLeftDots && shouldShowRightDots) {
			let middleRange = range(leftSiblingIndex, rightSiblingIndex);
			return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
		}
	}, [page, maxPages]);

	return (
		<div className="mt-5 flex flex-col md:flex-row items-center justify-between space-y-4">
			<div>
				{page * 25 - 25 + 1} - {page * 25} of {(maxPages * 25).toLocaleString('en')} Total
			</div>

			<div className="flex flex-row items-center">
				<div
					className={clsx('flex items-center justify-center hover:bg-green-400/90 h-9 w-9 rounded-full cursor-pointer', {
						hidden: page === 1,
					})}
					onClick={() => onPageChange(page - 1)}
				>
					<ChevronLeftIcon className="h-4 w-4" />
				</div>

				{paginationRange?.map((pageNumber, i) => {
					if (pageNumber === DOTS) {
						return (
							<div key={i} className="flex items-center justify-center h-9 w-9">
								&#8230;
							</div>
						);
					}

					return (
						<div
							key={i}
							className={clsx('flex items-center justify-center hover:bg-green-400/90 h-9 w-9 rounded-full cursor-pointer', {
								'bg-green-400/90 font-black': pageNumber === page,
							})}
							onClick={() => onPageChange(Number(pageNumber))}
						>
							{pageNumber}
						</div>
					);
				})}

				<div
					className={clsx('flex items-center justify-center hover:bg-green-400/90 h-9 w-9 rounded-full cursor-pointer', {
						hidden: page === maxPages,
					})}
					onClick={() => onPageChange(page + 1)}
				>
					<ChevronRightIcon className="h-4 w-4" />
				</div>
			</div>
		</div>
	);
};

export default Pagination;
