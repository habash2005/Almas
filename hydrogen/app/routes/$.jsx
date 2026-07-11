import {data} from 'react-router';
import NotFound from '~/components/NotFound';

export const meta = () => {
  return [{title: 'Page Not Found — ALMAS'}];
};

/**
 * Render the branded 404 page inside the site layout while still
 * responding with a 404 status code.
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return data(null, {status: 404});
}

export default function CatchAllPage() {
  return <NotFound />;
}

/** @typedef {import('./+types/$').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
