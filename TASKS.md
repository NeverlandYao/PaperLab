# 教研论文智能体系统执行清单

## 使用规则

1. 只按任务编号顺序推进，除标注可并行项外不跳步。
2. 每个任务必须同时满足“产出”和“验收标准”才可关闭。
3. 每次提交只解决一个任务，避免把问题混在一起。
4. 若发现需求变化，先更新 `Design.md`，再更新本清单。

## 里程碑

1. `M1` 前端可交互工作流完成
2. `M2` 后端接口与执行链路完成
3. `M3` 前后端联调通过并可演示

---

## Phase A：项目基线

### `A-01` 锁定范围与命名
- 依赖：无
- 产出：统一命名表（节点类型、字段名、接口路径）
- 验收标准：全项目只使用 `input / analysis / outline`，返回字段只使用 `summary / keywords / outline`
- 涉及文件：[Design.md](/Users/neverland/Codex/edu-paper/Design.md)

### `A-02` 建立任务追踪板
- 依赖：`A-01`
- 产出：任务状态看板（`todo / doing / done / blocked`）
- 验收标准：所有后续任务都能挂到看板且有负责人
- 涉及文件：[TASKS.md](/Users/neverland/Codex/edu-paper/TASKS.md)

---

## Phase B：前端可交互工作流（M1）

### `B-01` 搭建单页工作台骨架
- 依赖：`A-01`
- 产出：顶部栏、左侧节点库、中间画布、右侧参数面板、底部结果面板布局
- 验收标准：页面结构完整，桌面端可正常显示不重叠
- 涉及文件：`src/App.tsx`

### `B-02` 建立统一前端状态层
- 依赖：`B-01`
- 产出：统一管理 `nodes / edges / selectedNodeId / result / error / isRunning`
- 验收标准：画布、参数面板、结果面板都读取同一状态源
- 涉及文件：`src/components/WorkflowContext.tsx`

### `B-03` 定义节点类型与模板
- 依赖：`B-02`
- 产出：三类节点模板与默认参数
- 验收标准：可根据模板创建节点且字段完整
- 涉及文件：`src/types/workflow.ts`、`src/data/nodeTemplates.ts`

### `B-04` 接入 React Flow 画布
- 依赖：`B-03`
- 产出：可渲染可缩放画布与基础节点
- 验收标准：画布可缩放拖动，节点可显示
- 涉及文件：`src/components/FlowCanvas.tsx`

### `B-05` 实现左侧拖拽节点库
- 依赖：`B-04`
- 产出：3 个可拖拽节点入口
- 验收标准：节点可从左侧拖入画布并落位
- 涉及文件：`src/components/Sidebar.tsx`

### `B-06` 实现自定义节点 UI
- 依赖：`B-04`
- 产出：`InputNode / AnalysisNode / OutlineNode`
- 验收标准：节点可展示标题、摘要信息、状态颜色与连接点
- 涉及文件：`src/components/nodes/InputNode.tsx`、`src/components/nodes/AnalysisNode.tsx`、`src/components/nodes/OutlineNode.tsx`

### `B-07` 实现节点选中与参数面板
- 依赖：`B-02`、`B-06`
- 产出：点击节点后右侧展示对应表单并可编辑
- 验收标准：修改参数后节点数据实时更新且刷新不丢失
- 涉及文件：`src/components/ParameterPanel.tsx`

### `B-08` 实现连线与交互校验
- 依赖：`B-04`、`B-03`
- 产出：只允许 `input -> analysis -> outline`
- 验收标准：非法连线无法建立；合法连线可建立
- 涉及文件：`src/components/FlowCanvas.tsx`

### `B-09` 实现运行前业务校验
- 依赖：`B-08`、`B-07`
- 产出：校验函数 `validateWorkflow`
- 验收标准：缺节点、缺边、文献为空时会阻止运行并提示错误
- 涉及文件：`src/utils/validateWorkflow.ts`

### `B-10` 实现结果面板与节点状态反馈
- 依赖：`B-09`
- 产出：结果面板显示 `summary / keywords / outline`，节点状态支持 `idle/running/success/error`
- 验收标准：触发运行后能看到状态变化和结果渲染
- 涉及文件：`src/components/ResultPanel.tsx`、`src/components/WorkflowContext.tsx`

### `B-11` 前端质量门禁
- 依赖：`B-10`
- 产出：前端可构建且类型检查通过
- 验收标准：`npm run lint` 通过，`npm run build` 通过
- 涉及文件：`package.json`

---

## Phase C：后端接口与执行链路（M2）

### `C-01` 初始化 FastAPI 服务与 CORS
- 依赖：`A-01`
- 产出：`/ping` 可用，跨域配置完成
- 验收标准：`GET /ping` 返回 200，前端地址可跨域访问
- 涉及文件：`backend/main.py`

### `C-02` 定义请求模型与基础校验
- 依赖：`C-01`
- 产出：`nodes / edges` 请求模型与基本字段校验
- 验收标准：非法请求返回 4xx 且有明确 `detail`
- 涉及文件：`backend/main.py`

### `C-03` 实现工作流结构校验
- 依赖：`C-02`
- 产出：后端校验节点类型完整与边合法
- 验收标准：缺节点或链路错误时返回 400
- 涉及文件：`backend/workflow.py` 或 `backend/main.py`

### `C-04` 构造执行初始状态
- 依赖：`C-03`
- 产出：从节点参数映射到后端 `state`
- 验收标准：`topic/documents/keyword_count/level/paper_type/prompt` 映射准确
- 涉及文件：`backend/workflow.py`

### `C-05` 实现三步执行逻辑
- 依赖：`C-04`
- 产出：`read_input -> analyze -> outline`
- 验收标准：不依赖模型也能返回完整结果
- 涉及文件：`backend/workflow.py`

### `C-06` 接入 LangGraph 编排
- 依赖：`C-05`
- 产出：固定顺序执行图与 `graph.invoke`
- 验收标准：执行结果和普通函数路径一致
- 涉及文件：`backend/workflow.py`

### `C-07` 封装模型调用与降级策略
- 依赖：`C-05`
- 产出：有 key 调模型，无 key 走 fallback
- 验收标准：`OPENAI_API_KEY` 缺失时接口仍返回可用结果
- 涉及文件：`backend/workflow.py`

### `C-08` 打通 `/api/run-workflow`
- 依赖：`C-03`、`C-04`、`C-06`
- 产出：接口从请求到结果完整闭环
- 验收标准：合法请求返回 `summary/keywords/outline`
- 涉及文件：`backend/main.py`

### `C-09` 后端质量门禁
- 依赖：`C-08`
- 产出：后端可导入、可运行
- 验收标准：`python3 -m compileall backend` 通过，接口单测最少 3 条用例通过
- 涉及文件：`backend/`

---

## Phase D：前后端联调与演示（M3）

### `D-01` 前端接入真实后端请求
- 依赖：`B-10`、`C-08`
- 产出：点击运行触发 `/api/run-workflow`
- 验收标准：前端结果面板显示后端返回的真实数据
- 涉及文件：`src/utils/runWorkflow.ts`、`src/components/WorkflowContext.tsx`

### `D-02` 错误链路联调
- 依赖：`D-01`
- 产出：覆盖至少 5 类错误提示
- 验收标准：缺节点、缺边、输入为空、后端离线、后端异常都可被前端识别并提示
- 涉及文件：`src/components/WorkflowContext.tsx`、`src/components/ResultPanel.tsx`

### `D-03` 运行脚本与文档收口
- 依赖：`D-01`
- 产出：统一启动命令和说明
- 验收标准：新成员按 README 可在 15 分钟内跑通前后端
- 涉及文件：[README.md](/Users/neverland/Codex/edu-paper/README.md) 、`package.json`

### `D-04` 验收演示脚本
- 依赖：`D-02`、`D-03`
- 产出：一份 5 分钟演示路径
- 验收标准：可连续演示“拖拽->连线->改参->运行->看结果”
- 涉及文件：`README.md`（可附录）

---

## 发布前检查清单

1. 前端 `lint/build` 全通过。
2. 后端可启动且 `/ping` 正常。
3. `/api/run-workflow` 对合法请求返回 200。
4. 非法请求返回 4xx 且含清晰 `detail`。
5. 无模型密钥情况下可完整演示。
6. README 启动步骤与实际命令一致。

---

## 当前建议执行顺序

1. `B-01` 到 `B-04`
2. `C-01` 到 `C-03`
3. `B-05` 到 `B-10`
4. `C-04` 到 `C-09`
5. `D-01` 到 `D-04`

这条顺序的目的很简单：尽快打通主链路，再做稳定性和演示质量。
