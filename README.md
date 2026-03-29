# 教研论文智能体系统

基于 `React Flow + FastAPI + LangGraph` 的最小可用版项目。当前版本支持：

- 左侧节点库拖拽三个标准节点到画布
- 画布内连线，并限制为 `文献输入 → 主题分析 → 提纲生成`
- 右侧参数面板编辑节点参数
- 点击“运行测试”后调用后端 `/api/run-workflow`
- 后端使用 LangGraph 顺序执行三个步骤并返回摘要、关键词、提纲
- 未配置模型密钥时走规则化兜底结果；配置 `OPENAI_API_KEY` 且安装 `langchain-openai` 时可尝试真实模型调用

## 项目结构

```text
.
├── backend/
│   ├── main.py
│   ├── workflow.py
│   └── requirements.txt
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── data/
│   ├── types/
│   └── utils/
├── Design.md
└── package.json
```

## 前端启动

1. 安装依赖

```bash
npm install
```

2. 启动前端

```bash
npm run dev:frontend
```

前端默认地址：

```text
http://localhost:3000
```

## 后端启动

1. 安装 Python 依赖

```bash
python3 -m pip install -r backend/requirements.txt
```

2. 启动后端

```bash
npm run dev:backend
```

后端默认地址：

```text
http://localhost:8000
```

接口健康检查：

```bash
curl http://localhost:8000/ping
```

## 可选：接入真实模型

如果你希望后端优先尝试真实模型调用，可以设置：

```bash
export OPENAI_API_KEY=your_api_key
```

当 `OPENAI_API_KEY` 可用且 `langchain-openai` 已安装时，`backend/workflow.py` 会优先尝试调用模型；失败时仍会自动回退到本地规则生成结果。

## 当前实现范围

这是按 `Design.md` 完成的最小可用版，已经覆盖以下核心链路：

1. 工作流节点拖拽
2. 合法连线校验
3. 节点参数编辑
4. 前后端请求联通
5. LangGraph 顺序编排
6. 结果展示

如果要继续往完整版走，下一步通常是：

1. 补充节点执行中的逐节点状态流转
2. 增加保存/加载工作流 JSON
3. 接入真实文献检索和真实大模型提示工程
4. 增加测试与部署脚本
