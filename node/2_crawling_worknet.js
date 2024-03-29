const axios = require("axios");
const cheerio = require("cheerio");

require("dotenv").config({ path: `nodemailer/.env` });
const nodemailer = require("./nodemailer");

// 크롤링 대상
const getHTML = async (keyword, resultCnt, regionNumber) => {
  try {
    const html =
      // getJobs()을 호출할 때 워크넷 url은 "검색어(encodeURI), 검색 결과 수(resultCnt), 지역코드(regionNumber)"를 동적으로 받음
      // 검색어가 제대로 작동하지 않는 경우가 있었음. axios에서 받아오는 워크넷 url이 변경된것이 원인이었음
      (
        await axios.get(
          `https://www.work.go.kr/empInfo/empInfoSrch/list/dtlEmpSrchList.do?careerTo=&keywordJobCd=&occupation=&templateInfo=&shsyWorkSecd=&rot2WorkYn=&payGbn=&resultCnt=${resultCnt}&keywordJobCont=&cert=&cloDateStdt=&moreCon=&minPay=&codeDepth2Info=11000&isChkLocCall=&sortFieldInfo=DATE&major=&resrDutyExcYn=&eodwYn=&sortField=DATE&staArea=&sortOrderBy=DESC&keyword=${encodeURI(keyword)}&termSearchGbn=all&carrEssYns=&benefitSrchAndOr=O&disableEmpHopeGbn=&webIsOut=&actServExcYn=&maxPay=&keywordStaAreaNm=&emailApplyYn=&listCookieInfo=DTL&pageCode=&codeDepth1Info=11000&keywordEtcYn=&publDutyExcYn=&keywordJobCdSeqNo=&exJobsCd=&templateDepthNmInfo=&computerPreferential=&regDateStdt=&employGbn=&empTpGbcd=&region=${regionNumber}&infaYn=&resultCntInfo=${resultCnt}&siteClcd=all&cloDateEndt=&sortOrderByInfo=DESC&currntPageNo=1&indArea=&careerTypes=&searchOn=Y&tlmgYn=&subEmpHopeYn=&academicGbn=&templateDepthNoInfo=&foriegn=&mealOfferClcd=&station=&moerButtonYn=&holidayGbn=&srcKeyword=${encodeURI(keyword)}&enterPriseGbn=all&academicGbnoEdu=noEdu&cloTermSearchGbn=all&keywordWantedTitle=&stationNm=&benefitGbn=&keywordFlag=&notSrcKeyword=&essCertChk=&isEmptyHeader=&depth2SelCode=&_csrf=070d78d0-5056-4081-9019-d9ff14e35685&keywordBusiNm=&preferentialGbn=&rot3WorkYn=&pfMatterPreferential=&regDateEndt=&staAreaLineInfo1=11000&staAreaLineInfo2=1&pageIndex=1&termContractMmcnt=&careerFrom=&laborHrShortYn=`
        )
      ).data;
    return html;
  } catch (e) {
    console.log(e);
  }
};

// 크롤링, 파싱 처리
const parsing = async (page) => {
  const $ = cheerio.load(page);
  const jobs = [];
  const $jobList = $("tbody tr");
  $jobList.each((idx, node) => {
    const jobTitle = $(node).find(".cp-info-in:eq(0)").text().trim(); // 채용공고명
    const url =
      "https://www.work.go.kr" + $(node).find(".cp-info-in > a").attr("href"); // 채용공고 상세 보기 url
    const company = $(node).find(".cp_name:eq(0)").text().trim(); // 회사명
    const experience = $(node).find("em:eq(0)").text().trim(); // 경력
    const education = $(node)
      .find("em:eq(1)")
      .text()
      .trim()
      // .replace("\n\t\t\t\t\t\t\t\t\t\t", ""); // 학력
      .replace(/(\n)+(\t)*/, ""); // 학력(정규식 사용)
    const location = $(node).find("em:eq(2)").text().trim(); // 회사 위치

    if (jobTitle != "") {
      jobs.push({
        jobTitle,
        url,
        company,
        experience,
        education,
        location,
      });
    }
  });

  console.log(jobs.length); // 총 검색된 게시글 수를 콘솔창에서 확인

  return jobs;
};

// 검색어(keyword), 검색 결과 수(resultCnt, 최대 검색 건수 기본값 10), 지역코드(regionNumber)
const getJobs = async (keyword, resultCnt = "10", regionNumber = "") => {
  const html = await getHTML(keyword, resultCnt, regionNumber);
  const jobs = await parsing(html);
  console.log(jobs);

  // 이메일 테이블 생성 및 발송
  const h = [];
  h.push('<table style="border:1px solid black;">');
  h.push("<thead>");
  h.push("<tr>");
  h.push("<th>구인제목</th>");
  h.push("<th>회사명</th>");
  h.push("<th>경력</th>");
  h.push("<th>학력</th>");
  h.push("<th>위치</th>");
  h.push("</tr>");
  h.push("</thead>");
  h.push("<tbody>");
  jobs.forEach((j) => {
    h.push(`<tr>`);
    h.push(`<td><a href="${j.url}">${j.jobTitle}</a></td>`);
    h.push(`<td>${j.company}</td>`);
    h.push(`<td>${j.experience}</td>`);
    h.push(`<td>${j.education}</td>`);
    h.push(`<td>${j.location}</td>`);
    h.push(`</tr>`);
  });
  h.push("</tbody>");
  h.push("</table>");

  const message = {
    from: "ubithus@gmail.com",
    to: "ubithus@gmail.com",
    subject: `${keyword} 구인 회사 정보`,
    html: h.join(""),
  };
  await nodemailer.send(message);
};

getJobs("si", 1000, 26000); // 검색어 , 최대 검색 결과 수, 지역(26000 - 부산전체)
getJobs("정보처리기사", 1000, 26000); // 검색어 , 최대 검색 결과 수, 지역(26000 - 부산전체)
getJobs("javascript", 1000, 26000); // 검색어 , 최대 검색 결과 수, 지역(26000 - 부산전체)
getJobs("vue", 1000, 26000); // 검색어 , 최대 검색 결과 수, 지역(26000 - 부산전체)
getJobs("java", 1000, 26000); // 검색어 , 최대 검색 결과 수, 지역(26000 - 부산전체)
