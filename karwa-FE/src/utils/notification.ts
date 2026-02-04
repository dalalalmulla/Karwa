import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TaskStatus } from "@/src/types/taskTypes";

export type InAppNotification = {
    id: string;
    type: "TASK_STATUS_CHANGED";
    taskId: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
};

type StatusMap = Record<string, TaskStatus>;


const STATUS_MAP_KEY = "task_status_map_v1";
const NOTIFS_KEY = "in_app_notifications_v1";



export async function loadStatusMap(): Promise<StatusMap> {
    const raw = await AsyncStorage.getItem(STATUS_MAP_KEY);
    return raw ? (JSON.parse(raw) as StatusMap) : {};
}

export async function saveStatusMap(map: StatusMap) {
    await AsyncStorage.setItem(STATUS_MAP_KEY, JSON.stringify(map));
}

export async function loadNotifications(): Promise<InAppNotification[]> {
    const raw = await AsyncStorage.getItem(NOTIFS_KEY);
    return raw ? (JSON.parse(raw) as InAppNotification[]) : [];
}

export async function saveNotifications(list: InAppNotification[]) {
    await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
}

function statusLabel(s: TaskStatus) {
    if (s === "OPEN") return "Open";
    if (s === "IN_PROGRESS") return "In Progress";
    return "Completed";
}

export async function detectAndStoreTaskStatusChanges(params: {
    tasks: { _id: string; title: string; status: TaskStatus }[];
}): Promise<{ newNotifications: InAppNotification[]; unreadCount: number }> {
    const { tasks } = params;

    const prevMap = await loadStatusMap();
    const notifs = await loadNotifications();

    const now = new Date().toISOString();
    const newNotifs: InAppNotification[] = [];

    const nextMap: StatusMap = { ...prevMap };

    for (const t of tasks) {
        const prev = prevMap[t._id];
        const curr = t.status;

        if (!prev) {
            nextMap[t._id] = curr;
            continue;
        }

        if (prev !== curr) {
            nextMap[t._id] = curr;

            const n: InAppNotification = {
                id: `${t._id}_${Date.now()}`,
                type: "TASK_STATUS_CHANGED",
                taskId: t._id,
                title: "Task status updated",
                message: `${t.title} changed from ${statusLabel(prev)} to ${statusLabel(curr)}`,
                createdAt: now,
                read: false,
            };

            newNotifs.push(n);
        }
    }

    const merged = [...newNotifs, ...notifs].slice(0, 50);

    await saveStatusMap(nextMap);
    if (newNotifs.length > 0) await saveNotifications(merged);

    const unreadCount = merged.filter((x) => !x.read).length;

    return { newNotifications: newNotifs, unreadCount };
}

export async function markAllNotificationsRead() {
    const list = await loadNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    await saveNotifications(updated);
    return updated;
}
