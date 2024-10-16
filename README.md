# Capybara Project

## Getting Started

Running the development server, you can try the following command:

```bash
pnpm i
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Todo List

### Features

- [x] 笔记删除功能
- [ ] 笔记访问权限
- [ ] summary 功能
- [x] point 功能
- [ ] 笔记检索功能
- [ ] 直接跳转原网页
- [x] tag 标签删除功能
- [ ] 笔记子链接 (相关知识拓展连接｜关联连接)
- [ ] 卡片展示多种类排序

### Bugs

- [x] 笔记卡片栏不支持滚动
- [x] tag 为空时展示态异常 (空标签框)
- [x] 新增笔记时，截屏没有自动切换
- [x] 切换笔记时，截屏没有过渡效果，直接从上一份笔记截屏切换到当前笔记截屏
- [x] 笔记数据集初次载入的顺序是随机的
- [ ] 添加新笔记且存在滚动条时，滚动条不默认滚动到最底层

## Basic Info

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

> 若更改了 .env 环境变量配置文件，请在 vercel 平台上手动注入环境变量并重新部署。
