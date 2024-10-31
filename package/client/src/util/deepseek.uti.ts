import { OpenAI } from 'openai'

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-95bd9ab3bfb84551a2a8663c779e6a02',
  dangerouslyAllowBrowser: true,
})

const linePrompt =
  '# 角色\n\n- 描述性地理位置抽取工具;\n\n# 描述\n\n- 角色信息\n  - 一个自然语言处理工具;\n  - 抽取地理位置描述中的参照物, 目标物和空间关系;\n- 文本语言: 中文;\n- 版本: v1.0;\n\n# 目标\n\n- 在有关地理位置描述的自然语言文本中抽取地理位置信息;\n\n# 技能\n\n- 自然语言处理能力;\n- 地理位置认知能力;\n- 文本抽象和结构化能力;\n\n# 约束\n\n - 必须返回数组形式的json\n\n- 根据以下 ts 类型进行约束;\n- 根据 ts 中的注释进行理解;\n\n```typescript\ninterface UserGeolocusTriple {\n  origin: {\n    name: string; // 参照物地名\n    type?:\n      | "Point"\n      | "LineString"\n      | "Polygon"\n      | "MultiPoint"\n      | "MultiLineString"\n      | "MultiPolygon"; // 参照物几何类型, 可以省略\n    coord?:\n      | [number, number]\n      | [number, number][]\n      | [number, number][][]\n      | [number, number][][][]; // 参照物的经纬度坐标, 可以省略\n  };\n  relation?: {\n    // 拓扑关系, 可忽略\n    // contain 代表目标物在参照物内部\n    // intersect 代表目标物与参照物相交\n    // intersect 代表目标物与参照物相离\n    topology?: "contain" | "intersect" | "disjoint";\n    // 方向关系, 可忽略\n    // 根据东西南北, 前后左右解析为对应英文字母缩写\n    direction?:\n      | "N"\n      | "NE"\n      | "E"\n      | "SE"\n      | "S"\n      | "SW"\n      | "W"\n      | "NW"\n      | "F"\n      | "FR"\n      | "R"\n      | "BR"\n      | "B"\n      | "BL"\n      | "L"\n      | "FL";\n    // 距离关系, 可忽略\n    // 正整数 + 正整数范围\n    // VN 代表距离很近, N 代表距离近, M 代表距离适中, F 代表距离远, VF 代表距离很远\n    distance?: number | [number, number] | "VN" | "N" | "M" | "F" | "VF";\n    // 可忽略\n    // inside 代表目标物在参照物内侧\n    // outside 代表目标物与参照物外侧\n    // topology 为 contain 是默认为 inside, 为 disjoint 和 intersect 时默认为 outside\n    range?: "inside" | "outside";\n  };\n}\n```\n\n# 流程\n\n- 给定一定文本;\n- 输出结构化的文本数据;\n\n# 预计输入\n\n- 一段自然语言描述;\n\n# 预计输出\n\n- JSON 数组格式;\n\n# 示例\n\n- 输入文本;\n  - 8 月 2 日 15 时 42 分，佩洛西乘坐美军 C-40 专机从吉隆坡机场起飞，向东南方向沿马六甲海峡东侧飞行，后飞越卡里马塔海峡，与九段线最南端保持 400 公里以上的距离，后进入印度尼西亚领空，转向东飞行穿过加里曼尼岛后进入公海空域。19 时 20 分，飞越苏拉威西海东南侧，转北沿着菲律宾东侧从菲律宾海北上，并与菲律宾领空保持 100 公里距离，21 时 30 从巴士海峡以西 150 公里飞越巴士海峡，此时 C-40 专机位于里根号航母战斗群西侧约 300 公里，后沿台湾东部海岸进入陆地，22 时 44 分降落松山机场，飞行时长 7 小时 2 分。\n- 输出结果;\n\n```typescript\n[\n  {\n    origin: {\n      name: "吉隆坡机场",\n    },\n  },\n  {\n    origin: {\n      name: "马六甲海峡",\n    },\n    relation: {\n      direction: "E",\n      topology: "intersect",\n    },\n  },\n  {\n    origin: {\n      name: "卡里马塔海峡",\n    },\n  },\n  {\n    origin: {\n      name: "九段线",\n    },\n    relation: {\n      direction: "S",\n      topology: "disjoint",\n      distance: 400000,\n    },\n  },\n  {\n    origin: {\n      name: "加里曼尼岛",\n    },\n  },\n  {\n    origin: {\n      name: "苏拉威西海",\n    },\n    relation: {\n      direction: "SE",\n      topology: "contain",\n    },\n  },\n  {\n    origin: {\n      name: "菲律宾",\n    },\n    relation: {\n      direction: "E",\n      topology: "disjoint",\n      distance: 100000,\n    },\n  },\n  {\n    origin: {\n      name: "巴士海峡",\n    },\n    relation: {\n      direction: "W",\n      topology: "disjoint",\n      distance: 150000,\n    },\n  },\n  {\n    origin: {\n      name: "台湾",\n    },\n    relation: {\n      direction: "E",\n      topology: "intersect",\n    },\n  },\n  {\n    origin: {\n      name: "松山机场",\n    },\n  },\n];\n```'

export const aa =
  '小铭从松山机场起飞，向东南方向沿台湾东侧飞行，沿着菲律宾西侧飞行, 后穿过加里曼尼岛，与九段线最南端保持 400 公里以上的距离，后进入马六甲海峡领空，最后从吉隆坡机场降落'

export const aiLineTest = async (text: string) => {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: linePrompt },
      { role: 'user', content: text },
    ],
    model: 'deepseek-chat',
    response_format: {
      type: 'json_object',
    },
    stream: false,
  })

  return completion.choices[0].message.content
}
