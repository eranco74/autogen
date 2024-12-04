import React from "react";
import {
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  getBezierPath,
  BaseEdge,
} from "@xyflow/react";
import {
  LucideIcon,
  Users,
  Wrench,
  Settings,
  Brain,
  Timer,
  Workflow,
} from "lucide-react";
import { NodeData, CustomNode, DragItem } from "../types";
import {
  AgentConfig,
  TeamConfig,
  ModelConfig,
  ToolConfig,
  TerminationConfig,
  ComponentTypes,
} from "../../../../../types/datamodel";
import { useDroppable } from "@dnd-kit/core";

// Icon mapping for different node types
const iconMap: Record<NodeData["type"], LucideIcon> = {
  team: Users,
  agent: Brain,
  tool: Wrench,
  model: Settings,
  termination: Timer,
};

interface DroppableZoneProps {
  accepts: ComponentTypes[];
  children?: React.ReactNode;
  className?: string;
  id: string; // Add this to make each zone uniquely identifiable
}

const DroppableZone: React.FC<DroppableZoneProps> = ({
  accepts,
  children,
  className,
  id,
}) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data: { accepts },
  });

  // Fix the data path to handle nested current objects
  const isValidDrop =
    isOver &&
    active?.data?.current?.current?.type &&
    accepts.includes(active.data.current.current.type);

  return (
    <div
      ref={setNodeRef}
      className={`droppable-zone p-2 ${isValidDrop ? "can-drop" : ""} ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
};

// Base node layout component
interface BaseNodeProps extends NodeProps<CustomNode> {
  icon: LucideIcon;
  children?: React.ReactNode;
  headerContent?: React.ReactNode;
  descriptionContent?: React.ReactNode;
  className?: string;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  selected,
  dragHandle,
  icon: Icon,
  children,
  headerContent,
  descriptionContent,
  className,
}) => {
  return (
    <div
      ref={dragHandle}
      className={`
        bg-white relative rounded-lg shadow-lg w-72 
        ${selected ? "ring-2 ring-accent" : ""}
        ${className || ""} 
        transition-all duration-200
      `}
    >
      <div className="border-b p-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">{data.label}</span>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700">
            {data.type}
          </span>
        </div>
        {headerContent}
      </div>

      {descriptionContent && (
        <div className="px-3 py-2 border-b text-sm text-gray-600">
          {descriptionContent}
        </div>
      )}

      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
};

// Reusable components
const NodeSection: React.FC<{
  title: string | React.ReactNode;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="space-y-1">
    <h4 className="text-xs font-medium text-gray-500 uppercase">{title}</h4>
    <div className="bg-gray-50 rounded p-2">{children}</div>
  </div>
);

const ConnectionBadge: React.FC<{
  connected: boolean;
  label: string;
}> = ({ connected, label }) => (
  <span
    className={`
      text-xs px-2 py-1 rounded-full
      ${connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}
    `}
  >
    {label}
  </span>
);

// Team Node
export const TeamNode: React.FC<NodeProps<CustomNode>> = (props) => {
  const config = props.data.config as TeamConfig;
  const hasModel = !!config.model_client;
  const participantCount = config.participants?.length || 0;

  return (
    <BaseNode
      {...props}
      icon={iconMap.team}
      headerContent={
        <div className="flex gap-2 mt-2">
          <ConnectionBadge connected={hasModel} label="Model" />
          <ConnectionBadge
            connected={participantCount > 0}
            label={`${participantCount} Participants`}
          />
        </div>
      }
      descriptionContent={
        <div>
          <div>Type: {config.team_type}</div>
          {config.selector_prompt && (
            <div className="mt-1 text-xs">
              Selector: {config.selector_prompt}
            </div>
          )}
        </div>
      }
    >
      {(config.model_client || config.termination_condition) && (
        <Handle
          type="target"
          position={Position.Left}
          id={`${props.id}-input-handle`}
          className="my-left-handle"
        />
      )}
      <Handle
        type="source"
        position={Position.Right}
        id={`${props.id}-output-handle`}
        className="my-right-handle"
      />
      <NodeSection title="Model">
        <div className="relative">
          {config.model_client && (
            <div className="text-sm">{config.model_client.model}</div>
          )}
          <DroppableZone id={`${props.id}-model-zone`} accepts={["model"]}>
            <div className="text-secondary text-xs my-1 text-center">
              Drop model here
            </div>
          </DroppableZone>
        </div>
      </NodeSection>

      <NodeSection
        title={
          <div>
            Participants{" "}
            <span className="text-xs text-accent">{participantCount}</span>
          </div>
        }
      >
        <div className="space-y-1">
          {config.participants?.map((participant, index) => (
            <div
              key={index}
              className="relative text-sm py-1 px-2 bg-white rounded flex items-center gap-2"
            >
              <Brain className="w-4 h-4 text-gray-500" />
              <span>{participant.name}</span>
            </div>
          ))}
          <DroppableZone id={`${props.id}-agent-zone`} accepts={["agent"]}>
            <div className="text-secondary text-xs my-1 text-center">
              Drop agents here
            </div>
          </DroppableZone>
        </div>
      </NodeSection>

      <NodeSection title="Terminations">
        <div className="space-y-1">
          {config.termination_condition && (
            <div className="text-sm py-1 px-2 bg-white rounded flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-500" />
              <span>{config.termination_condition.termination_type}</span>
            </div>
          )}
          <DroppableZone
            id={`${props.id}-termination-zone`}
            accepts={["termination"]}
          >
            <div className="text-secondary text-xs my-1 text-center">
              Drop termination here
            </div>
          </DroppableZone>
        </div>
      </NodeSection>
    </BaseNode>
  );
};

export const AgentNode: React.FC<NodeProps<CustomNode>> = (props) => {
  const config = props.data.config as AgentConfig;
  const hasModel = !!config.model_client;
  const toolCount = config.tools?.length || 0;

  return (
    <BaseNode
      {...props}
      icon={iconMap.agent}
      headerContent={
        <div className="flex gap-2 mt-2">
          <ConnectionBadge connected={hasModel} label="Model" />
          <ConnectionBadge
            connected={toolCount > 0}
            label={`${toolCount} Tools`}
          />
        </div>
      }
      descriptionContent={
        <div>
          <div>Type: {config.agent_type}</div>
          {config.system_message && (
            <div className="mt-1 text-xs">{config.system_message}</div>
          )}
        </div>
      }
    >
      <Handle
        type="target"
        position={Position.Left}
        id={`${props.id}-input-handle`}
        className="my-left-handle"
      />

      <Handle
        type="target"
        position={Position.Right}
        id={`${props.id}-output-handle`}
        className="my-right-handle"
      />

      <NodeSection title="Model">
        <div className="relative">
          {config.model_client && (
            <>
              {" "}
              <div className="text-sm">{config.model_client.model}</div>
            </>
          )}
          <DroppableZone id={`${props.id}-model-zone`} accepts={["model"]}>
            <div className="text-secondary text-xs my-1 text-center">
              Drop model here
            </div>
          </DroppableZone>
        </div>
      </NodeSection>

      <NodeSection title="Tools">
        <div className="space-y-1">
          {config.tools && toolCount > 0 && (
            <div className="space-y-1">
              {config.tools.map((tool, index) => (
                <div
                  key={index}
                  className="relative text-sm py-1 px-2 bg-white rounded flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-gray-500" />
                  <span>{tool.name}</span>
                </div>
              ))}
            </div>
          )}
          <DroppableZone id={`${props.id}-tool-zone`} accepts={["tool"]}>
            <div className="text-secondary text-xs my-1 text-center">
              Drop tools here
            </div>
          </DroppableZone>
        </div>
      </NodeSection>
    </BaseNode>
  );
};

// Model Node
export const ModelNode: React.FC<NodeProps<CustomNode>> = (props) => {
  const config = props.data.config as ModelConfig;

  return (
    <BaseNode
      {...props}
      icon={iconMap.model}
      descriptionContent={
        <div>
          <div>Type: {config.model_type}</div>
          {config.base_url && (
            <div className="mt-1 text-xs">URL: {config.base_url}</div>
          )}
        </div>
      }
    >
      <Handle
        type="source" // This model's handle should be source since it connects TO team/agent
        position={Position.Right}
        id={`${props.id}-output-handle`}
        className="my-right-handle"
      />
      <NodeSection title="Configuration">
        <div className="text-sm">Model: {config.model}</div>
      </NodeSection>
    </BaseNode>
  );
};

// Tool Node
export const ToolNode: React.FC<NodeProps<CustomNode>> = (props) => {
  const config = props.data.config as ToolConfig;

  return (
    <BaseNode
      {...props}
      icon={iconMap.tool}
      descriptionContent={<div>Tool Type: {config.tool_type}</div>}
    >
      <Handle
        type="source"
        position={Position.Right}
        id={`${props.id}-output-handle`} // Add index to match store logic
        className="my-right-handle"
      />
      <NodeSection title="Configuration">
        <div className="text-sm">{config.description}</div>
      </NodeSection>

      <NodeSection title="Content">
        <div className="text-sm">{config.content}</div>
      </NodeSection>
    </BaseNode>
  );
};

// Termination Node

// First, let's add the Termination Node component
export const TerminationNode: React.FC<NodeProps<CustomNode>> = (props) => {
  const config = props.data.config as TerminationConfig;

  return (
    <BaseNode
      {...props}
      icon={iconMap.termination}
      descriptionContent={<div>Type: {config.termination_type}</div>}
    >
      <Handle
        type="source"
        position={Position.Right}
        id={`${props.id}-output-handle`}
        className="my-right-handle"
      />

      <NodeSection title="Configuration">
        <div className="text-sm">
          {config.max_messages && (
            <div>Max Messages: {config.max_messages}</div>
          )}
          {/* {config.max_tokens && (
            <div>Max Tokens: {config.max_tokens}</div>
          )}
          {config.content_check && (
            <div>Content Check: {config.content_check}</div>
          )} */}
        </div>
      </NodeSection>
    </BaseNode>
  );
};

// Export all node types
export const nodeTypes = {
  team: TeamNode,
  agent: AgentNode,
  model: ModelNode,
  tool: ToolNode,
  termination: TerminationNode,
};

const EDGE_STYLES = {
  "model-connection": { stroke: "rgb(59, 130, 246)" },
  "tool-connection": { stroke: "rgb(34, 197, 94)" },
  "participant-connection": { stroke: "rgb(168, 85, 247)" },
} as const;

type EdgeType = keyof typeof EDGE_STYLES;

export const CustomEdge = ({ data, ...props }: EdgeProps) => {
  const [edgePath] = getBezierPath(props);
  const edgeType = (data?.type as EdgeType) || "model-connection";

  return (
    <BaseEdge
      path={edgePath}
      style={{ ...EDGE_STYLES[edgeType], strokeWidth: 2 }}
      {...props}
    />
  );
};

export const edgeTypes = {
  "model-connection": CustomEdge,
  "tool-connection": CustomEdge,
  "participant-connection": CustomEdge,
};
