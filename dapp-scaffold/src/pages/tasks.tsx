import type { NextPage } from "next";
import Head from "next/head";
import { TaskView } from "../views/TaskView";
import { AppLayout } from "../components/layouts/PageLayout";

const Tasks: NextPage = () => {
  return (
    <AppLayout>
      <Head>
        <title>LockdIn Tasks</title>
        <meta
          name="description"
          content="Manage your decentralized tasks on Solana"
        />
      </Head>
      <TaskView />
    </AppLayout>
  );
};

export default Tasks;