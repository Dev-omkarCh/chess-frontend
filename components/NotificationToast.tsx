'use client';
import Avatar from '@/features/social/Avatar';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { dismissNotification } from '@/redux/notificationSlice';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationToast = () => {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector((state) => state.notification.toastStack);

    // We only care about the latest one for the top-right pop
    const current = notifications[0];

    if (!current) return null;

    return (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current._id}
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className="pointer-events-auto w-80 bg-card border border-border shadow-2xl rounded-2xl p-4 backdrop-blur-md"
                >
                    <div className="flex justify-between items-start gap-3">
                        <div className='flex-shrink-0'>
                            <img src={current.sender.avatar} alt="" className='w-10 h-10 rounded-full' />
                        </div>
                        <div>
                            {/* <h4 className="font-bold text-primary">{current.type.replace('_', ' ')}</h4> */}
                            <p className="text-sm text-muted-foreground">{current.message}</p>
                        </div>
                        <button
                            onClick={() => dispatch(dismissNotification(current._id))}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};