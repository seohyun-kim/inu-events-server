import {defineSchema} from '../../libs/schema';
import {z} from 'zod';
import {defineRoute} from '../../libs/route';
import {getCustomRepository} from "typeorm";
import EventRepository from "../../libs/application/events/event-repository";
import GetEvent from "../../../service/event/GetEvent";


const schema = defineSchema({
    params: {
        eventId: z.string(),
    },
});

export default defineRoute('get', '/event/:eventId?', schema, async (req, res) => {

    const {eventId} = req.params;
    const Event_Information = await GetEvent.getEvent(eventId);
    return res.json(Event_Information)
});