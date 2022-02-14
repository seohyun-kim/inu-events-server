import {BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import Event from './Event';
import Comment from './Comment';
import {UserReponse} from '../service/types';

/**
 * 사용자!
 */
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({comment: '식별자.'})
  id: number;

  @Column({comment: '가입한 이메일.'})
  email: string;

  @Column({comment: '사용자 닉네임.'})
  nickname: string;

  @Column({comment: '로그인한 방법(카카오, 구글 등).'})
  oauthProvider: string;

  @Column({comment: 'OAuth로 로그인한 경우, provider가 제공한 식별자.'})
  oauthId: string;

  @Column({comment: '자동로그인용 토큰.'})
  rememberMeToken: string;

  @Column({nullable: true, comment: 'FCM 토큰.'})
  fcmToken?: string;

  @Column({comment: '전체 알림 수신 여부.'})
  subscribing: boolean = false;

  @Column({nullable: true, comment: '전체 알림 키워드 필터(쉼표로 구분).'})
  subscribingOn?: string;

  @CreateDateColumn({comment: '생성 일시.'})
  createdAt: Date;

  @Column({nullable: true, comment: '삭제 일시.'})
  deletedAt?: Date;

  @OneToMany(() => Event, (e) => e.user)
  events: Event[];

  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];

  subscribeOn(keywords?: string) {
    if (keywords != null) {
      this.subscribingOn = keywords;
    }

    this.subscribing = true;

    console.log(`이제 이 사용자(id: ${this.id})는 다음 키워드에 대해 알림을 받습니다: ${keywords}`);
  }

  unsubscribe() {
    console.log(`이제 이 사용자(id: ${this.id})는 알림을 받지 않습니다.`);

    this.subscribing = false;
  }

  shallThisUserBeNotifiedWithThisEvent(event: Event): boolean {
    // 이 사용자가 이 이벤트의 알림을 수신해야 할까?

    if (!this.subscribing) {
      // 구독 안함!
      return false;
    }

    if (this.subscribingOn == null) {
      // 구독 하는데 키워드 명시 안함: 다 받음.
      return true;
    }

    const keywords = this.subscribingOn.split(',').map(k => k.trim());
    const text = event.title // TODO 잘 선택하자

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        // 구독 하고, 해당 이벤트에 구독중인 키워드가 들어가 있음.
        return true;
      }
    }

    // 구독 하고, 구독중인 키워드도 있지만 이 이벤트는 아님.
    return false;
  }

  toResponse(): UserReponse {
    return {
      id: this.id,
      email: this.email,
      nickname: this.nickname,
    }
  }
}

export default User;
