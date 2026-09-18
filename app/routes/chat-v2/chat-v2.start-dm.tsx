import { paths } from '../../lib/paths';
import { createStartDmAction } from '../chat/chat-start-dm.server';

export const action = createStartDmAction(paths.chatV2Room);
