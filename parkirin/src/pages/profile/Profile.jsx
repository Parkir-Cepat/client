import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import useAuthStore from '../../store/authStore';
import ProfileCard from '../../components/profile/ProfileCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GET_ME = gql`
  query Me {
    me {
      _id
      email
      name
      role
      saldo
      avatar
      is_email_verified
      created_at
    }
  }
`;

const Profile = () => {
  const { data, loading, error } = useQuery(GET_ME);
  const { updateProfile: updateAuthProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (data?.me) {
      setFormData({
        name: data.me.name || '',
        avatar: data.me.avatar || ''
      });
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateAuthProfile(formData.name);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" variant="primary" />;
  
  if (error) return (
    <div className="w-full py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <Card className="bg-red-50 border border-red-100" padding="medium" rounded="xl">
        <p className="text-red-600">Error: {error.message}</p>
      </Card>
    </div>
  );

  const user = data?.me;

  return (
    <div className="w-full py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-500">My Profile</h1>
        {!isEditing && (
          <Button
            variant="primary"
            size="medium"
            rounded="full"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card className="overflow-hidden" rounded="xl" shadow="lg">
          <Card.Header>
            <Card.Title>Edit Profile</Card.Title>
          </Card.Header>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Avatar URL"
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="medium"
                rounded="full"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="medium"
                rounded="full"
                loading={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <ProfileCard 
          user={user} 
          onEditProfile={() => setIsEditing(true)}
          onEditAvatar={(file) => console.log('Edit avatar:', file)}
        />
      )}
    </div>  );
};

export default Profile;