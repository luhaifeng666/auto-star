# auto-star

![nodeVersion](https://img.shields.io/badge/node-14.15.0%2B-green)

## 说明
用于催学社自动star项目，项目地址维护在[这里](https://vika.cn/workbench/dst4inQ7sWdyUT3Xi9/viwWt7BNc5Hw3)~

## 使用方式
1. fork一份代码
2. 去github账号下的 `Settings / Developer settings` 中生成一个token
3. 将token配置到fork的项目中 `Settings / Secrets` 中， 并取名为 `TOKEN`
4. 修改 `.github/workflows/main.yml` 中的 `vikaToken` 配置，将其改为自己的vikaToken。点击下图中的按钮，会提示你绑定邮箱并新增vikaToken。**注意：邮件可能会被放到垃圾邮箱中，留意下~**
5. ![img.png](img.png)
6. 自动star的操作于每日上午9点自动执行，如果想要改变时间，可以去 `.github/workflows/main.yml` 中修改 `cron` 配置。时间为 `UTC时间`，所以设置时需要 `减去8小时`


## Todo List
1. 目前获取starred列表时固定获取前100条记录，考虑到后期催~~卷~~学社的小伙伴们star的项目会超过100，近日会添加分页获取。
