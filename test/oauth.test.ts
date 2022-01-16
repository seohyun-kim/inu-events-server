import {getGoogleOAuthInfo} from '../src/oauth';
import Any = jasmine.Any;

describe('구글 OAuth 라이브러리', () => {
  it('터뜨리기', async () => {
    try {
      const info = await getGoogleOAuthInfo("114295479731429206524");
      console.log(info);
    } catch (e) {
      if (e instanceof TypeError) {
        console.log('TypeError 발생! 고럼고럼 이래야지');
      } else {
        console.error('이건모임??????????');
      }
    }
  });
});
