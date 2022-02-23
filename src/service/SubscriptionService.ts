import User from '../entity/User';
import assert from 'assert';
import {NoSuchResource} from '../common/errors/general';
import {z} from 'zod';
import {Infer} from '../common/utils/zod';

class SubscriptionService {
  async getSubscription(userId: number) : Promise<Infer<typeof SubscriptionSchema>> {
    const user = await User.findOne(userId);

    assert(user, NoSuchResource());

    return {
      subscribing: user.subscribing,
    }
  }

  async updateSubscription(userId: number, subscribe: boolean) {
    const user = await User.findOne(userId);

    assert(user, NoSuchResource());

    user.setSubscription(subscribe);

    await user.save();
  }

  async getTopics(userId: number) : Promise<Infer<typeof TopicsScheme>> {
    const user = await User.findOne(userId);

    assert(user, NoSuchResource());

    return {
      topics: user.getTopics(),
    }
  }

  async updateTopics(userId: number, topics: string[]) {
    const user = await User.findOne(userId);

    assert(user, NoSuchResource());

    user.setTopics(topics);

    await user.save();
  }
}

export default new SubscriptionService();

export const SubscriptionSchema = {
  subscribing: z.boolean()
}

export const TopicsScheme = {
  topics: z.array(z.string())
}
