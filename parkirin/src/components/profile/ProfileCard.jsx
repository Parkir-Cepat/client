import React from 'react';
import { UserIcon, CameraIcon, EnvelopeIcon, CalendarIcon, CheckBadgeIcon, WalletIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ProfileCard = ({ user, onEditProfile, onEditAvatar, loading = false }) => {
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onEditAvatar(file);
    }
  };

  return (
    <Card className="overflow-hidden" rounded="xl" shadow="lg" padding="none">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-32 relative"></div>
      <div className="px-6 pb-6">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
          {/* Avatar Section */}
          <div className="relative -mt-12 mx-auto md:mx-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white p-1 shadow-lg">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">{user?.name?.charAt(0)}</span>
                </div>
              )}
            </div>
            
            {/* Upload Avatar Button */}
            <label className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full cursor-pointer hover:bg-orange-700 transition-colors shadow-md">
              <CameraIcon className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Loading...'}</h2>
            <div className="flex items-center justify-center md:justify-start mt-1 text-gray-600">
              <EnvelopeIcon className="h-4 w-4 mr-1" />
              <span>{user?.email}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
              <Badge 
                variant="primary" 
                size="md" 
                rounded="full" 
                className="capitalize"
              >
                {user?.role}
              </Badge>
              {user?.is_email_verified && (
                <Badge 
                  variant="success" 
                  size="md" 
                  rounded="full"
                  icon={<CheckBadgeIcon className="h-4 w-4" />}
                >
                  Email Verified
                </Badge>
              )}
            </div>
            
            {/* Saldo */}
            <div className="mt-4 flex items-center justify-center md:justify-start">
              <div className="p-2 bg-green-100 rounded-full mr-2">
                <WalletIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <span className="text-sm text-gray-600">Balance: </span>
                <span className="text-lg font-semibold text-green-600">
                  Rp {user?.saldo?.toLocaleString('id-ID') || '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Button
              onClick={onEditProfile}
              disabled={loading}
              variant="primary"
              size="medium"
              rounded="full"
              loading={loading}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex space-x-3">
            <div className="p-2 bg-orange-100 rounded-full h-min">
              <UserIcon className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="p-2 bg-orange-100 rounded-full h-min">
              <CalendarIcon className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
