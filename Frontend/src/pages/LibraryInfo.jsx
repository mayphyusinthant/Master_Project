import Map from '../components/Map';
import { PageTitle } from '../components/pageTitle';
import map from '../assets/Floors/FLOOR B.svg';

export const LibraryInfo = () => {
  return (
    <>
      <PageTitle title="Library Information" />
      <Map zoom={3} map={map} />
    </>
  );
};
