// app/my-punks/page.tsx
import dynamic from 'next/dynamic';

const DownloadModal = dynamic(() => import('@/components/modals/DownloadModal'), {
  loading: () => <Spinner />,
});

const DetailsModal = dynamic(() => import('@/components/modals/DetailsModal'), {
  loading: () => <Spinner />,
});