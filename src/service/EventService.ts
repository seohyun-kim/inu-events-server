import Event from '../entity/Event';
import {log} from '../common/utils/log';
import {preview} from '../server/libs/json';
import User from '../entity/User';
import Comment from '../entity/Comment';
import EventLike from '../entity/EventLike';
import EventNotification from '../entity/EventNotification';
import UserService from './UserService';
import SubscriptionService from './SubscriptionService';
import {Infer} from '../common/utils/zod';
import { EventRequestScheme} from '../entity/schemes';
import {MoreThanOrEqual} from "typeorm";

class EventService {
  async makeEvent(userId: number, body: Infer<typeof EventRequestScheme>): Promise<Event> {
    const user = await UserService.getUser(userId);

    const event = await Event.create({user, ...body}).save();

    log(`이벤트를 생성합니다: ${preview(body)}`);

    await SubscriptionService.broadcast(event);

    return event;
  }

  async getEvent(eventId: number): Promise<Event> {
    const event = await Event.findOneOrFail(eventId);

    event.hit();
    await event.save();

    return event;
  }

  async getMyEvents(userId: number): Promise<Event[]> {
    const user = await User.findOneOrFail(userId);

    return await Event.find({where: {user}, order: {id: 'DESC'}});
  }

  // 이벤트 전체 가져옴 ( 이전 버전용 남겨둠 )
  async getEvents(userId?: number): Promise<Event[]> {
    if (userId == null) {
      return await this.getEventsRegardlessBlockings(); // 비회원은 전부
    } else {
      return await this.getEventsWithoutBlockedUser(userId); // 로그인 한 사람은 blocking user 빼고
    }
  }

  // 페이지 별로 이벤트 가져옴 (NEW) TODO
  async getEventsbyPage(userId?: number, pageNum?:number, pageSize?:number ): Promise<Event[]> {
    if(pageNum != null  && pageSize != null){
      // 일단은 회원 비회원 구분 X
      return await this.getEventsRegardlessBlockingsbyPage(pageNum, pageSize);
    }else {
      return await this.getEventsRegardlessBlockings();
    }
  }


  // 로그인 안했을 때 (비회원)
  private async getEventsRegardlessBlockings(): Promise<Event[]> { // 기존
    return await Event.find({order: {id: 'DESC'}});
  }

  // 전체 페이지 수 가져오기
  async getTotalEvent(): Promise<number> {
    const page =  await Event.count();
    log(`전체 이벤트 수는 ${page}.`)
    return await Event.count();

  }

  private async getEventsRegardlessBlockingsbyPage(pageNum:number, pageSize:number): Promise<Event[]>  {
    const offset = pageSize * pageNum;

    return await Event.find(
        {order: {id: 'DESC'},
          skip: offset,
          take: pageSize,});
  }


  // 됨 :)
  private async getEventsWithoutBlockedUser(requestorId: number): Promise<Event[]> {
    return await Event.createQueryBuilder('event')
      /** relations 필드 가져오는 부분 */
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.comments', 'comments')
      .leftJoinAndSelect('event.likes', 'likes')
      .leftJoinAndSelect('event.notifications', 'notifications')

      /** where 절을 위한 join(select는 안 함) */
      .leftJoin('event.user', 'event_composer')
      .where(`event_composer.id NOT IN (
        SELECT blocked_user_id 
        FROM block
        WHERE block.blocking_user_id = :requestorId
      )`, {requestorId})
        .orderBy('event.id', 'DESC')

      .getMany(); // group by 안해도 얘가 잘 처리해줌 ^~^
  }


  /**
   * 현재 진행 중인 행사만 가져옵니다.
   * @param userId 내 사용자 id.
   */
  async getEventsOnGoing(userId?: number): Promise<Event[]> {
    return await this.getEventsOnGoingRegardlessBlockings();
  }

  // 마감되지 않은(현재 진행중인) 행사 전부 가져오기
  private async getEventsOnGoingRegardlessBlockings(): Promise<Event[]> {
    return await Event.find(
        {where: {endAt: MoreThanOrEqual(new Date())},
        order: {id: 'DESC'}
      });
  }


  /**
   * 내가 댓글을 단 Event를 모두 가져오기.
   * @param userId 내 사용자 id.
   */
  async getEventsIveCommentedOn(userId: number): Promise<Event[]> {
    return await Event.createQueryBuilder('event')

      /** relations 필드 가져오는 부분 */
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.comments', 'comments')
      .leftJoinAndSelect('event.likes', 'likes')
      .leftJoinAndSelect('event.notifications', 'notifications')

      /** where 절을 위한 join(select는 안 함) */
      .leftJoin('event.comments', 'event_comments')
      .leftJoin('event_comments.user', 'comments_user')
      .where('comments_user.id = :userId', {userId})

      .getMany(); // group by 안해도 얘가 잘 처리해줌 ^~^
  }

  async patchEvent(eventId: number, body: Partial<Infer<typeof EventRequestScheme>>): Promise<string> {
    log(`이벤트 ${eventId}를 업데이트합니다: ${preview(body)}`);

    const patchevent = await Event.update(
      {id: eventId},
      body
    );

    return patchevent.raw;
  }

  async deleteEvent(eventId: number): Promise<void> {
    const event = await Event.findOneOrFail(eventId);

    log(`${event}를 삭제하기에 앞서, 이벤트에 딸린 댓글을 모두 지웁니다.`);
    await Comment.delete({event});

    log(`${event}를 삭제하기에 앞서, 이벤트에 딸린 좋아요를 모두 지웁니다.`);
    await EventLike.delete({event});

    log(`${event}를 삭제하기에 앞서, 이벤트에 딸린 알림을 모두 지웁니다.`);
    await EventNotification.delete({event});

    log(`이제 ${event}를 삭제합니다.`);
    await Event.delete({id: eventId});
  }
}

export default new EventService();
