
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Event, UserRole } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import EventFormModal from '../components/EventFormModal';
import { HeroSection, CategoriesSection, FeaturedEventsSection, BannerSection } from '../components/PageSections';

const Home: React.FC = () => {
  const { settings, isEditing, updateHomeLayout, t } = useSettings();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const handleUpdateSectionData = (index: number, newData: any) => {
      const newSections = [...settings.homeLayout];
      newSections[index].data = { ...newSections[index].data, ...newData };
      updateHomeLayout(newSections);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
      const newSections = [...settings.homeLayout];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newSections.length) {
          const temp = newSections[index];
          newSections[index] = newSections[targetIndex];
          newSections[targetIndex] = temp;
          updateHomeLayout(newSections);
      }
  };

  const handleToggle = (index: number) => {
      const newSections = [...settings.homeLayout];
      newSections[index].isVisible = !newSections[index].isVisible;
      updateHomeLayout(newSections);
  };

  const handleDelete = (index: number) => {
      if(window.confirm("Remove this section?")) {
          const newSections = settings.homeLayout.filter((_, i) => i !== index);
          updateHomeLayout(newSections);
      }
  };

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    await db.addEvent({
      id: Math.random().toString(36).substr(2, 9),
      title: eventData.title!,
      description: eventData.description!,
      date: eventData.date!,
      time: eventData.time!,
      location: eventData.location!,
      price: eventData.price!,
      imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=800',
      category: eventData.category!,
      organizerId: 'admin1',
      status: 'approved',
      isFeatured: eventData.isFeatured || false
    } as Event);
    window.location.reload();
  };

  const visibleSections = isEditing 
      ? settings.homeLayout 
      : settings.homeLayout.filter(s => s.isVisible);

  return (
    <div className="space-y-12 pb-20 relative">
      {visibleSections.map((section, index) => {
          const props = {
              key: section.id,
              id: section.id,
              isActive: section.isVisible,
              isEditing,
              settings,
              sectionData: section.data,
              onUpdate: (data: any) => handleUpdateSectionData(index, data),
              onMove: (dir: 'up'|'down') => handleMove(index, dir),
              onToggle: () => handleToggle(index),
              onDelete: () => handleDelete(index),
              onQuickAdd: () => setIsEventModalOpen(true)
          };

          switch(section.type) {
              case 'hero': return <HeroSection {...props} />;
              case 'categories': return <CategoriesSection {...props} />;
              case 'featured': return <FeaturedEventsSection {...props} />;
              case 'banner': return <BannerSection {...props} />;
              default: return null;
          }
      })}

      <EventFormModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSubmit={handleEventSubmit}
          userRole={UserRole.ADMIN}
      />
    </div>
  );
};

export default Home;
