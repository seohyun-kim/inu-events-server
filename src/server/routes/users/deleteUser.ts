import {defineSchema} from '../../libs/schema';
import {z} from 'zod';
import {defineRoute} from '../../libs/route';
import {getCustomRepository} from "typeorm";
import DeleteUser from '../../../service/user/DeleteUser';


const schema = defineSchema({
    params: {
        oauthId: z.string(),
    },
});

export default defineRoute('delete', '/user/:oauthId?', schema, async (req, res) => {

    const {oauthId} = req.params;
    await DeleteUser.deleteUser(oauthId);
    return res.send(`유저 ${oauthId}를 삭제했습니다.`);

});