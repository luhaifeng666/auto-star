const chalk = require('chalk')
const { Octokit } = require("octokit");
const { Vika } = require('@vikadata/vika')
const core = require('@actions/core');

// 获取token
const auth = core.getInput('token')
// 获取vika token
const token = core.getInput('vikaToken')

// 初始化octokit
const octokit = new Octokit({ auth })

// 初始化vika
const vika = new Vika({ token, fieldKey: 'name' })
// 通过 datasheetId 来指定要从哪张维格表操作数据。
const datasheet = vika.datasheet('dst4inQ7sWdyUT3Xi9')

/**
 * 格式化数据，取出所有的repo地址
 * @param data
 * @returns {string[]|*[]}
 */
function initData (data) {
	if (data) {
		const { records = [] } = data
		return records.map(record => {
			// 如果没有填写https，补充下
			let url = record.fields['mini-vue repo']
			url = `${url.includes('https://') ? '' : 'https://'}${url}`
			return url
		})
	}
	return []
}

/**
 * 获取owner以及repo信息
 * @param repoUrl
 * @returns {{}|*}
 */
function getRepoInfo (repoUrl) {
	if (repoUrl) {
		return repoUrl.split('/').slice(-2).reduce((obj, item, index) => ({
			...obj,
			[index ? 'repo' : 'owner']: item.split('.git')[0] // 排除有些同学填写了.git后缀
		}), {})
	}
	return {}
}

/**
 * star操作
 * @param params
 */
function starHandle (params) {
	Promise.allSettled(params[0].map(param => octokit.rest.activity.starRepoForAuthenticatedUser(param))).then(res => {
		if (res) {
			res.forEach(item => {
				if (item.status === 'fulfilled') {
					const info = getRepoInfo(item.value.url)
					console.log(chalk.green(`https://github.com/${info.owner}/${info.repo} has been starred~`))
				}
			})
		}
	}).catch(err => {
		console.log(chalk.red(err))
	})
}

// 获取repo记录
async function getRepos () {
	let data = null
	await datasheet.records.query({ viewId: "viwWt7BNc5Hw3"}).then(response => {
		if (response.success) {
			data = initData(response.data)
		} else {
			console.log(chalk.red(`Get repos data error! The error message is : ${JSON.stringify(response)}`))
		}
	})
	return data
}

// 获取所有的repo路径
getRepos().then(repos => {
	if (repos) {
		// 获取已经start的repo列表
		octokit.rest.activity.listReposStarredByAuthenticatedUser({ per_page: 100 }).then(res => {
			if (res.status === 200) {
				const starredRepos = res.data.map(item => item.html_url)
				// 筛选尚未start的repo列表
				const unStarredRepos = repos.filter(repo => !starredRepos.includes(repo))
				// 获取参数列表
				const paramsList = unStarredRepos.reduce((arr, req, index) => {
					// 最大请求数为30个/次
					if (!(index % 30)) {
						arr.push([])
					}
					arr[arr.length - 1].push(getRepoInfo(req))
					return arr
				}, [])
				// 开始star
				starHandle(paramsList.splice(0, 1))
				// 定时执行剩下没有star的repo
				if (paramsList.length) {
					const timer = setInterval(() => {
						if (paramsList.length) {
							starHandle(paramsList.splice(0, 1))
						} else {
							// 列表清空时，清空计时器
							clearInterval(timer)
						}
					}, 1000 * 60)
				}
			} else {
				console.log(chalk.red('Get starred repos failed!'))
			}
		})
	}
})
