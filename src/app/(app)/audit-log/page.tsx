
"use client";

import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const actionColors: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    "TIMETABLE_UPDATE": "default",
    "CONSTRAINT_CHANGE": "secondary",
    "USER_LOGIN": "outline",
    "ATTENDANCE_MARKED": "default",
};

export default function AuditLogPage() {
    const { auditLogs } = useContext(DataContext);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-headline font-bold">Audit Log</h1>
            <p className="text-muted-foreground">
                A chronological record of all significant actions performed within the system.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>System Actions</CardTitle>
                    <CardDescription>
                        Tracks edits, generations, and other important events for transparency and accountability.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auditLogs.length > 0 ? (
                                auditLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>
                                                        {log.user.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-0.5">
                                                    <span className="font-medium">{log.user}</span>
                                                    <Badge variant="outline" className="w-fit">{log.role}</Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={actionColors[log.action] || "secondary"}>{log.action.replace(/_/g, ' ')}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                                        <TableCell className="font-mono text-xs">{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No audit events recorded yet. Perform an action like editing the timetable to see a log here.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
