## Web Crawling E-Mail Service

+ 개발 내용 : "검색어"와 "지역코드"에 맞는 구직 정보를 워크넷에서 크롤링해 개인 메일로 발송하는 기능을 수행하는 프로그램이다.

+ 개발 동기
  + 시간을 절약하기 위해 워크넷에서 원하는 구직 정보만 개인 메일로 받아 보고 싶었다.
  + 스케줄링까지 적용해 매일 정해진 시간에 자동으로 이메일 구직 정보를 받아 볼 수 있도록 만드는 것을 목표로 하고 있다.

+ 사용 기술 : Node.js와 아래의 Library를 사용했다.
  + axios
  + cheerio
  + dotenv
  + nodemailer
