import { motion } from 'framer-motion';
import Link from 'next/link';

import { CustomIcon, MessageIcon, VercelIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <CustomIcon size={64} />
        </p>
          <b>
            Welcome to MedAI health assessment chatbot.
          </b>
          <p>
            Engage with a smart, multi-lingual medical chatbot that understands your symptoms, 
            provides tailored assessments, and connects you to the right healthcare professional.
          </p>

      </div>
    </motion.div>
  );
};
