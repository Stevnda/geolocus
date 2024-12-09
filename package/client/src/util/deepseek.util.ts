/* eslint-disable @typescript-eslint/no-unused-vars */
import { OpenAI } from 'openai'

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-95bd9ab3bfb84551a2a8663c779e6a02',
  dangerouslyAllowBrowser: true,
})

const prompt =
  '首先感谢你能够为我作出以下工作, 下面是你即将扮演的角色, 希望你能够按照以下要求帮助我完成任务, 最后真挚感谢你为我做出的贡献, 谢谢您!\n\n# 角色\n\n- 描述性地理位置文本解析工具;\n\n# 描述\n\n- 角色信息\n  - 一个自然语言处理工具;\n  - 抽取描述性地理位置文本中的参照物, 目标物和空间关系;\n  - 构造具有一定结构的JSON格式数据;\n- 文本语言: 中文;\n- 版本: v1.0;\n\n# 技能\n\n- 自然语言处理能力;\n- 地理位置认知能力;\n- 文本抽象和结构化能力;\n\n# 约束\n\n- 根据以下 ts 类型进行约束;\n- 根据 ts 中的注释进行理解;\n\n```typescript\ninterface UserGeolocusTriple {\n  originList: // 参照物数组\n  // 数组元素可能是一个对象, 也可能是 UserGeolocusTriple\n  (\n    | {\n        name: string // 参照物地名\n        type?:\n          | "Point"\n          | "LineString"\n          | "Polygon"\n          | "MultiPoint"\n          | "MultiLineString"\n          | "MultiPolygon" // 参照物几何类型, 可以省略\n        coord?:\n          | [number, number]\n          | [number, number][]\n          | [number, number][][]\n          | [number, number][][][] // 参照物的经纬度坐标, 若文本中具有坐标, 进行提取, 否则可以省略\n      }\n    | UserGeolocusTriple\n  )[]\n  relation?: {\n    // 拓扑关系, 可忽略\n    // disjoint 代表目标物与参照物相离\n    // contain 代表目标物在参照物内部\n    // within 代表参照物 在目标物内部\n    // intersect 代表目标物与参照物相交\n    // along 代表目标物与参照物相接\n    topology?: "disjoint" | "contain" | "within" | "intersect" | "along"\n    // 方向关系, 可忽略\n    // 方向关系分为数值 方向关系和语义方向关系\n    // 数值方向关系是通过方位角来描述, 0 代表北, 90 代表东, 180 代表南, 270 代表西\n    // 语义方向关系根据东西南北, 前后左右解析为对应英文字母缩写\n    direction?:\n      | "N"\n      | "NE"\n      | "E"\n      | "SE"\n      | "S"\n      | "SW"\n      | "W"\n      | "NW"\n      | "F"\n      | "FR"\n      | "R"\n      | "BR"\n      | "B"\n      | "BL"\n      | "L"\n      | "FL"\n    // 距离关系, 可忽略\n    // 精确距离使用正整数 + 正整数范围\n    // 语义距离自动转换为以下英文字母缩写, 其含义如下\n    // VN 代表距离很近, N 代表距离近, M 代表距离适中, F 代表距离远, VF 代表距离很远\n    distance?: number | [number, number] | "VN" | "N" | "M" | "F" | "VF"\n    // 可忽略\n    // inside 代表目标物在参照物内侧\n    // outside 代表目标物与参照物外侧\n    // both 代表目标物在参照物内侧和外侧\n    // 默认为 both\n    range?: "inside" | "outside" | "both"\n    // 目标物, 即目标物的名称\n    target: string\n  }\n}\n```\n\n# 预计输入\n\n- 描述性地理位置文本;\n\n# 预计输出\n\n- 结构化的 JSON 对象;\n- JSON 对象必须为 UserGeolocusTriple[], 不能添加其 他字段;\n\n# 示例\n\n## 示例 1\n\n### 输入\n\n8 月 2 日 15 时 42 分, 佩洛西乘坐美军 C-40 专机从吉隆坡机场起飞, 向东南方向沿马六甲海峡东侧飞行, 后飞越卡里马塔海峡, 与九段线最南端保持 400 公里以上的距离, 后进入印度尼 西亚领空, 转向东飞行穿过加里曼尼岛后进入公海空域. 19 时 20 分, 飞越苏拉威西海东南侧, 转北沿着菲律宾东侧从菲律宾海北上, 并与菲律宾领空保持 100 公里距离, 21 时 30 从巴士海峡以西 150 公里飞越巴士海峡, 此时 C-40 专机位 于里根号航母战斗群西侧约 300 公里, 后沿台湾东部海岸进入陆地, 22 时 44 分降落松山机场, 飞行时长 7 小时 2 分.\n\n### 输出\n\n```json\n[\n  {\n    "originList": [\n      {\n        "name": "吉隆坡机场"\n      }\n    ],\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "马六甲海峡"\n      }\n    ],\n    "relation": {\n      "direction": "E",\n      "topology": "intersect"\n    },\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "卡里马塔海峡"\n      }\n    ],\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "九段线"\n      }\n    ],\n    "relation": {\n      "direction": "S",\n      "topology": "disjoint",\n      "distance": 400000\n    },\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "加 里曼尼岛"\n      }\n    ],\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "苏拉威西海"\n      }\n    ],\n    "relation": {\n      "direction": "SE",\n      "topology": "contain"\n    },\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "菲律宾"\n      }\n    ],\n    "relation": {\n      "direction": "E",\n      "topology": "along",\n      "distance": 100000\n    },\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "巴士海峡"\n      }\n    ],\n    "relation": {\n      "direction": "W",\n      "topology": "disjoint",\n      "distance": 150000\n    },\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "台湾"\n      }\n    ],\n    "relation": {\n      "direction": "E",\n      "topology": "intersect"\n    },\n    "target": "佩洛西飞行路线"\n  },\n  {\n    "originList": [\n      {\n        "name": "松山机场"\n      }\n    ],\n    "target": "佩洛西飞行路线"\n  }\n]\n```\n\n## 示例 2\n\n### 输入\n\n飞机在台 湾东南方 100 km, 飞机位于巴士海峡内部\n\n### 输出\n\n```json\n[\n  {\n    "originList": [\n      {\n        "name": "台湾"\n      }\n    ],\n    "relation": {\n      "direction": "SE",\n      "topology": "disjoint",\n      "distance": 100000\n    },\n    "target": "飞机"\n  },\n  {\n    "originList": [\n      {\n        "name": "巴士海峡"\n      }\n    ],\n    "relation": {\n      "topology": "contain"\n    },\n    "target": "飞机"\n  }\n]\n```\n'

const testData = [
  {
    role: 'default',
    originList: [
      {
        name: '吉隆坡机场',
      },
    ],
    target: '佩洛西蹿台路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '马六甲海峡',
      },
    ],
    relation: {
      direction: 'E',
      topology: 'intersect',
    },
    target: '佩洛西蹿台路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '卡里马塔海峡',
      },
    ],
    target: '佩洛西蹿台路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '加里曼尼岛',
      },
    ],
    target: '佩洛西蹿台路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '苏拉威西海',
      },
    ],
    relation: {
      direction: 'SE',
      topology: 'contain',
    },
    target: '佩洛西蹿台路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '菲律宾',
      },
    ],
    relation: {
      direction: 'E',
      topology: 'along',
      distance: 100000,
    },
    target: '佩洛西蹿台路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '台湾',
      },
    ],
    relation: {
      direction: 'E',
      topology: 'intersect',
    },
    target: '佩洛西蹿台路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '松山机场',
      },
    ],
    target: '佩洛西蹿台路线',
  },
]

// 2.新街口位于南京市中心，地铁一号线和二号线在此交汇
const pointTestData = [
  {
    role: 'default',
    originList: [
      {
        name: '南京地铁一号线',
      },
    ],
    relation: {
      topology: 'along',
      distance: 1000,
    },
    target: '新街口',
  },
  {
    role: 'default',
    originList: [
      {
        name: '南京地铁二号线',
      },
    ],
    relation: {
      topology: 'along',
      distance: 1000,
    },
    target: '新街口',
  },
  {
    role: 'default',
    originList: [
      {
        name: '南京市',
      },
    ],
    relation: {
      topology: 'contain',
    },
    target: '新街口',
  },
]

// 从北京首都国际机场起飞，途经山东半岛上空，沿东海岸线向南飞行，最终降落在上海浦东国际机场。
const lineTestData = [
  {
    role: 'default',
    originList: [
      {
        name: '北京首都国际机场',
      },
    ],
    target: '飞行路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '山东省',
      },
    ],
    relation: {
      topology: 'contain',
    },
    target: '飞行路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '东海岸线',
      },
    ],
    relation: {
      topology: 'along',
    },
    target: '飞行路线',
  },
  {
    role: 'default',
    originList: [
      {
        name: '上海浦东国际机场',
      },
    ],
    relation: {
      topology: 'contain',
    },
    target: '飞行路线',
  },
]

export const deepseek = async (text: string): Promise<string> => {
  // const completion = await openai.chat.completions.create({
  //   messages: [
  //     { role: 'system', content: prompt },
  //     { role: 'user', content: text },
  //   ],
  //   model: 'deepseek-chat',
  //   stream: false,
  // })

  // let content = completion.choices[0].message.content
  // if (content) {
  //   content = content.replace(/```json/g, '')
  //   content = content.replace(/```/g, '')
  // }

  // console.log(content)

  // return content || '[]'
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log(text)
  return JSON.stringify(testData)
}
