import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EmptyState, EmptyStateProps } from './empty-state';

export default {
  title: 'Dashboard/EmptyState',
  component: EmptyState,
  argTypes: {
    type: {
      control: { type: 'select', options: ['no-tasks', 'no-search-results', 'no-projects', 'no-notifications', 'custom'] },
    },
    onAction: { action: 'clicked' },
  },
} as Meta;

const Template: StoryFn<EmptyStateProps> = (args) => (
  <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
    <EmptyState {...args} />
  </div>
);

export const NoTasks = Template.bind({});
NoTasks.args = {
  type: 'no-tasks',
};

export const NoSearchResults = Template.bind({});
NoSearchResults.args = {
  type: 'no-search-results',
};

export const NoProjects = Template.bind({});
NoProjects.args = {
  type: 'no-projects',
};

export const NoNotifications = Template.bind({});
NoNotifications.args = {
  type: 'no-notifications',
};

export const Custom = Template.bind({});
Custom.args = {
  type: 'custom',
  title: 'Custom Empty State',
  message: 'This is a custom empty state message with your own content.',
  actionText: 'Do Something',
};

export const WithCustomIllustration = Template.bind({});
WithCustomIllustration.args = {
  type: 'custom',
  title: 'Custom Illustration',
  message: 'This empty state uses a custom illustration component.',
  illustration: (
    <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </div>
  ),
};

export const WithoutAction = Template.bind({});
WithoutAction.args = {
  type: 'no-tasks',
  showAction: false,
  message: 'This empty state does not show an action button.',
};