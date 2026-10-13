import Landing from './ui/Landing';
import { getProgramme } from './server';
export const dynamic = 'force-dynamic';
export default async function Page() { return <Landing programme={await getProgramme()}/>; }
