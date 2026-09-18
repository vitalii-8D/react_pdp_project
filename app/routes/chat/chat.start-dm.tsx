import { paths } from '../../lib/paths';
import { createStartDmAction } from './chat-start-dm.server';

export const action = createStartDmAction(paths.chatRoom);
