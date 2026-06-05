"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { banUser, unbanUser } from "@/app/actions/admin"
import { Ban, CheckCircle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  banned: boolean
  createdAt: Date
}

export function UserManagement({ users }: { users: User[] }) {
  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    try {
      if (isBanned) {
        await unbanUser(userId)
      } else {
        await banUser(userId)
      }
    } catch (error) {
      console.error("Failed to toggle ban:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {user.role !== "admin" && (
                    <Button
                      variant={user.banned ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleBan(user.id, user.banned)}
                    >
                      {user.banned ? (
                        <>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Unban
                        </>
                      ) : (
                        <>
                          <Ban className="mr-1 h-4 w-4" />
                          Ban
                        </>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
