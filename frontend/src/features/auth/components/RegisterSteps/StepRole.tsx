import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import {  UserEmployeeIcon, StoreIcon } from '../../../../assets/SvgIcons';
import type { Role } from '../../types';

const cards: Array<{
  id: number;
  role: Role;
  svg: typeof StoreIcon;
  title: string;
  description: string;
}> = [
  {
    id: 1,
    role : "owner",
    svg : StoreIcon,
    title: 'I am a Store Owner',
    description: 'Full access to manage products, stocks, staffs, and sales.',
  },
  {
    id: 2,
    role : "employee",
    svg : UserEmployeeIcon,
    title: 'I am an Employee',
    description: 'Manage stock levels, orders, and products of a store.',
  }
];

interface StepRoleProps {
  onSelectRole: (role: Role) => void;
  selectedRole: Role | null;
}

export default function StepRole({ onSelectRole, selectedRole }: StepRoleProps) {

    return (
    <div className='flex gap-2 w-full'>
    {cards.map((card, index) => (
        <Card
        key={index}
        className="flex-1"        
        sx={{
            borderRadius: "4px",
            border: selectedRole === card.role ? "1px solid #3376FC" : "2px solid transparent",
            backgroundColor: selectedRole === card.role ? "rgba(51, 118, 252, 0.03)" : "white",
            transition: "0.25s ease",
        }}
        >
        <CardActionArea
            onClick={() => onSelectRole(card.role)}
            sx={{
            height: "100%",
            ".MuiTouchRipple-child": {
                backgroundColor: "#3376FC !important", 
            },
            paddingX : "20px",
            paddingY : "72px"
            }}
        >
            <div className="px-6 py-5 flex flex-col items-center ">
                <div className=''>
                    <card.svg
                        className={`w-10 h-10 mb-4 ${selectedRole === card.role ? "text-[#3376FC]" : "text-gray-500"}`}
                    />
                </div>
                <div className="font-nunito font-bold text-center text-md">
                    {card.title}
                </div>
                <div className="text-center font-lato text-sm text-gray-600">
                    {card.description}
                </div>
            </div>
        </CardActionArea>
        </Card>
    ))}
    </div>

  );
}
