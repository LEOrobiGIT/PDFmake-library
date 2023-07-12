import { getFileNames } from '../api';

export async function get(request, response) {
  try {
    const fileNames = getFileNames();
    response.writeHead(200, {
      'Content-Type': 'application/json'
    });
    response.end(JSON.stringify({ fileNames }));
  } catch (error) {
    console.error(error);
    response.writeHead(500, {
      'Content-Type': 'application/json'
    });
    response.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}