import {defineSchema} from '../../libs/schema';
import {z} from 'zod';
import {defineRoute} from '../../libs/route';
import {getCustomRepository} from "typeorm";
import UserRepository from "../../libs/application/user/user-repository";


const schema = defineSchema({
    params: {
        oauthId: z.string(),
    },
    query: {
        nickname: z.string(),
    }
});

export default defineRoute('patch', '/user/:oauthId?', schema, async (req, res) => {

    const {oauthId} = req.params;

    await getCustomRepository(UserRepository).patchUser(oauthId, req.query);
    return res.send(`유저 ${oauthId}의 정보를 ${JSON.stringify(req.query)}으로 변경하였습니다.`);

});