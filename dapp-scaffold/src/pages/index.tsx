import type { NextPage } from "next";
import dynamic from "next/dynamic";

const HomeView = dynamic(
  () => import('../views/home').then((mod) => mod.HomeView),
  { ssr: false }
);

const Home: NextPage = () => {
  return <HomeView />;
};

export default Home;