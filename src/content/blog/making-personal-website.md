---
pubDate: "2026-07-04T00:00:00-04:00"
title: "갠홈 만든 방법"
tags: ["blog", "tutorial", "2026-07"]
id: "blog-01"
---

## 간단한 갠홈 만들기 스텝!!

제가 쓰고 가장 나앗던 방법만 적엇답니다. 초보자도 따를 수 있다~~!

1. **호스팅**: Cloudflare 에서 계정을 만드세요.
2. **도메인**: 클프에서 원하는 도메인을 사시던지 공짜 도메인을 쓰세요.  
   +예: 제 도메인은 topfuelbread.com 이랍니다 호호. 1년에 10불이죠.
3. **코딩**: 아스트로 Astro.js 에서 샘플 프로젝트를 다운받고 꾸미던지 나중에 꾸미던지.  
   +제 멋진 소스코드를 참조하셔도 좋아요. 비공개라 연락 주시면 보내드립니다 ..
4. **코드 저장**: ^에서 만든 프로젝트를 Github에 새 repo로 올리세요.
5. **연결**: GitHub에 올린 코드가 인터넷에서 보이게 만드는 단계예요. GitHub랑 Cloudflare를 연결합니다.

   +[Astro + Cloudflare 배포 가이드](https://docs.astro.build/en/guides/deploy/cloudflare/#how-to-deploy-with-cicd)를 따라 하세요.
   +꼭 확인할 것:
   - Custom Domain에 너의 도메인 추가
   - Build command를 가이드에 나온 대로 변경

   **Cloudflare에서 가는 길**

   ```
   Dashboard → Workers & Pages → Create application → Connect to Git
   → GitHub repo 선택 → Domains → Add custom domain
   ```

6. www: 그리고 url에 www를 추가하려면 `Workers & Pages -> 프로젝트이름 -> Domain -> Custom Domains and Routes` 에다가 www 넣어주세요. 이때까지 몰랐자나~

## 악!!!!!!!!!!!!!!드디어 된다!!!!!!!!!!!!꺄홋~~~~ 개조아~~~~~~~~~~~

불태웟다

ㅇㅣ 튜토리얼의 장점은 깃헙에 올린 코드를 바로바로 제 갠홈으로 업뎃시켜 준다는 거죠
따로 뭘 처리할 필요가 없답니당 ^0^

---

### 2026/07/04 추가

Astro 를 쓰기 전에 [Hugo](https://gohugo.io/documentation/)를 먼저 써봤는데  
저는 아스트로가 범용성이나 스케일이나 여러 방면에서 더 쓰기 좋은 거 같더라고요.

제가 작년 9월 7일에 썼던 글입니다:

### 2025-09-07

#### Astro

What I like about Astro so far:

- more programmer-friendly
- in-depth tutorial for project setup
- less file generation at build

~~I've stopped at this step: https://docs.astro.build/en/tutorial/6-islands/4/~~ Done!

#### Cloudflare

I'm using Cloudflare to:

- registered a custom domain
- host the build from Github
- Yay now I have a website on a custom domain!

#### Steps:

1. Register a custom domain from [Cloudflare Registrar](https://www.cloudflare.com/en-ca/products/registrar/)
2. Follow the steps for [Deploy your Astro Site to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/#how-to-deploy-with-cicd)
3. On Cloudflare Worker page, add your custom domain
