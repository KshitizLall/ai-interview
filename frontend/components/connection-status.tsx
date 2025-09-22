import React from 'react'
import { cn } from '@/lib/utils'
import { useWebSocketContext } from './websocket-provider'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react'

interface ConnectionStatusProps {
  className?: string
  showDetails?: boolean
  size?: 'sm' | 'default' | 'lg'
}

export function ConnectionStatus({ 
  className, 
  showDetails = false, 
  size = 'default' 
}: ConnectionStatusProps) {
  const { status, isConnected, isConnecting, connectionId, lastError, clearError } = useWebSocketContext()

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          label: 'Connected',
          color: 'bg-green-500',
          badgeVariant: 'default' as const,
          textColor: 'text-green-600'
        }
      case 'connecting':
      case 'reconnecting':
        return {
          icon: Loader2,
          label: status === 'connecting' ? 'Connecting...' : 'Reconnecting...',
          color: 'bg-yellow-500',
          badgeVariant: 'secondary' as const,
          textColor: 'text-yellow-600',
          animate: true
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Disconnected',
          color: 'bg-gray-500',
          badgeVariant: 'outline' as const,
          textColor: 'text-gray-600'
        }
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Connection Error',
          color: 'bg-red-500',
          badgeVariant: 'destructive' as const,
          textColor: 'text-red-600'
        }
      default:
        return {
          icon: WifiOff,
          label: 'Unknown',
          color: 'bg-gray-500',
          badgeVariant: 'outline' as const,
          textColor: 'text-gray-600'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  if (!showDetails) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('relative')}>
          <div 
            className={cn(
              'rounded-full',
              sizeClasses[size],
              config.color
            )}
          />
          {isConnected && (
            <div 
              className={cn(
                'absolute inset-0 rounded-full animate-ping',
                config.color,
                'opacity-75'
              )}
            />
          )}
        </div>
        <Icon 
          className={cn(
            sizeClasses[size],
            config.textColor,
            config.animate && 'animate-spin'
          )} 
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Badge variant={config.badgeVariant} className="flex items-center gap-1">
          <Icon 
            className={cn(
              'h-3 w-3',
              config.animate && 'animate-spin'
            )} 
          />
          {config.label}
        </Badge>
        
        {connectionId && showDetails && (
          <span className="text-xs text-muted-foreground font-mono">
            {connectionId.slice(0, 8)}...
          </span>
        )}
      </div>

      {lastError && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700 flex-1">{lastError}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearError}
            className="h-6 px-2 text-red-600 hover:text-red-700"
          >
            ×
          </Button>
        </div>
      )}

      {showDetails && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Status: {status}</div>
          {connectionId && <div>ID: {connectionId}</div>}
          <div>Real-time features: {isConnected ? 'Active' : 'Inactive'}</div>
        </div>
      )}
    </div>
  )
}